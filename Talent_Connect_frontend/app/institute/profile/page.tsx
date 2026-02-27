'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Save, Loader2, CheckCircle } from 'lucide-react';

type Option = { value: number | string; label: string };

function useOptions(apiPath: string, valueKey: string, labelKey: string) {
    const [opts, setOpts] = useState<Option[]>([]);
    useEffect(() => {
        api.get(`/${apiPath}`).then(r =>
            setOpts(r.data.map((x: any) => ({ value: x[valueKey], label: x[labelKey] })))
        ).catch(() => { });
    }, [apiPath]);
    return opts;
}

const FIELD = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            {label}{required && <span className="text-error ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

const INPUT = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...p} className="input input-bordered w-full text-sm" />
);

const SELECT = ({ value, onChange, opts, placeholder }: { value: any; onChange: (v: any) => void; opts: Option[]; placeholder?: string }) => (
    <select value={value ?? ''} onChange={e => onChange(e.target.value ? +e.target.value : null)}
        className="select select-bordered w-full text-sm">
        <option value="">{placeholder || 'Select…'}</option>
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

const RADIO = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div className="flex gap-6 mt-1">
        {['Y', 'N'].map(v => (
            <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" className="radio radio-primary radio-sm" checked={value === v} onChange={() => onChange(v)} />
                {v === 'Y' ? 'Yes' : 'No'}
            </label>
        ))}
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-base-100 border border-base-200 dark:border-base-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-base-content/50 border-b border-base-200 dark:border-base-700 pb-2">{title}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
);

export default function InstituteProfilePage() {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // All dropdowns
    const typeOpts = useOptions('institute-type', 'institute_type_id', 'institute_type');
    const subTypeOpts = useOptions('institute-sub-type', 'institute_sub_type_id', 'institute_sub_type');
    const ownershipOpts = useOptions('institute-ownership-type', 'institute_ownership_type_id', 'institute_type');
    const affiliationOpts = useOptions('affiliation', 'affiliating_body_id', 'affiliating_body');
    const regulatoryOpts = useOptions('regulatory', 'regulatory_body_id', 'regulatory_body');
    const boardOpts = useOptions('board', 'university_board_id', 'university_board_name');
    const stateOpts = useOptions('state', 'lgdstateid', 'statename');
    const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
    const enrollmentOpts = useOptions('institute-enrollment', 'institute_enrollment_id', 'instituteenrollmenttype');
    const trainingTypeOpts = useOptions('training-type', 'training_type_id', 'training_type');

    // Load districts when state changes
    useEffect(() => {
        if (!data?.lgdstateId) return;
        api.get(`/district?state_id=${data.lgdstateId}`)
            .then(r => setDistrictOpts(r.data.map((d: any) => ({ value: d.districtid, label: d.districtname }))))
            .catch(() => { });
    }, [data?.lgdstateId]);

    useEffect(() => {
        if (!user?.institute_id) return;
        api.get(`/institute/${user.institute_id}`)
            .then(r => { setData(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user?.institute_id]);

    const set = (key: string) => (val: any) =>
        setData((prev: any) => ({ ...prev, [key]: val }));

    const setInput = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setData((prev: any) => ({ ...prev, [key]: e.target.value }));

    const handleSave = async () => {
        if (!user?.institute_id) return;
        setSaving(true); setError('');
        try {
            await api.patch(`/institute/${user.institute_id}`, {
                institute_name: data.institute_name,
                institute_type_id: data.institute_type_id,
                institute_sub_type_id: data.institute_sub_type_id,
                institute_ownership_type_id: data.institute_ownership_type_id,
                affiliating_body_id: data.affiliating_body_id,
                regulatory_body_id: data.regulatory_body_id,
                university_board_id: data.university_board_id,
                lgdstateId: data.lgdstateId,
                lgddistrictId: data.lgddistrictId,
                address: data.address,
                pincode: data.pincode,
                phone: data.phone,
                mobileno: data.mobileno,
                emailId: data.emailId,
                altemailId: data.altemailId,
                url: data.url,
                fax: data.fax,
                contactperson: data.contactperson,
                designation: data.designation,
                year_of_establishment: data.year_of_establishment,
                institute_abbreviation: data.institute_abbreviation,
                institute_rural_urban_status: data.institute_rural_urban_status,
                institute_enrollment_id: data.institute_enrollment_id,
                totalseatIntake: data.totalseatIntake,
                is_placement_cell_available: data.is_placement_cell_available,
                placement_officer_contact_number: data.placement_officer_contact_number,
                placement_officer_email_id: data.placement_officer_email_id,
                is_institute_offerened_training: data.is_institute_offerened_training,
                training_type_id: data.training_type_id,
                latitude: data.latitude,
                longitude: data.longitude,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to save. Please try again.');
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3 text-base-content/50">
            <Loader2 className="animate-spin" size={24} /> Loading profile…
        </div>
    );
    if (!data) return (
        <div className="flex items-center justify-center h-64 text-error text-sm">
            Unable to load institute profile.
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">My Profile</h1>
                    <p className="text-sm text-base-content/50 mt-0.5">Update your institute information</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            {saved && (
                <div className="flex items-center gap-2 bg-success/10 border border-success/30 text-success text-sm px-4 py-3 rounded-xl">
                    <CheckCircle size={16} /> Profile updated successfully!
                </div>
            )}
            {error && (
                <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            {/* Basic Info */}
            <Section title="Basic Information">
                <div className="md:col-span-2">
                    <FIELD label="Institute Name" required>
                        <INPUT value={data.institute_name || ''} onChange={setInput('institute_name')} />
                    </FIELD>
                </div>
                <FIELD label="Abbreviation">
                    <INPUT value={data.institute_abbreviation || ''} onChange={setInput('institute_abbreviation')} />
                </FIELD>
                <FIELD label="Registration ID">
                    <INPUT value={data.institute_registration_id || ''} disabled className="opacity-60" />
                </FIELD>
                <FIELD label="Year of Establishment">
                    <INPUT type="number" value={data.year_of_establishment || ''} onChange={setInput('year_of_establishment')} />
                </FIELD>
                <FIELD label="Website URL">
                    <INPUT value={data.url || ''} onChange={setInput('url')} placeholder="https://..." />
                </FIELD>
            </Section>

            {/* Classification */}
            <Section title="Classification">
                <FIELD label="Institute Type" required>
                    <SELECT value={data.institute_type_id} onChange={set('institute_type_id')} opts={typeOpts} />
                </FIELD>
                <FIELD label="Institute Sub Type">
                    <SELECT value={data.institute_sub_type_id} onChange={set('institute_sub_type_id')} opts={subTypeOpts} />
                </FIELD>
                <FIELD label="Ownership Type">
                    <SELECT value={data.institute_ownership_type_id} onChange={set('institute_ownership_type_id')} opts={ownershipOpts} />
                </FIELD>
                <FIELD label="Affiliating Body">
                    <SELECT value={data.affiliating_body_id} onChange={set('affiliating_body_id')} opts={affiliationOpts} />
                </FIELD>
                <FIELD label="Regulatory Body">
                    <SELECT value={data.regulatory_body_id} onChange={set('regulatory_body_id')} opts={regulatoryOpts} />
                </FIELD>
                <FIELD label="University / Board">
                    <SELECT value={data.university_board_id} onChange={set('university_board_id')} opts={boardOpts} />
                </FIELD>
                <FIELD label="Enrollment Type">
                    <SELECT value={data.institute_enrollment_id} onChange={set('institute_enrollment_id')} opts={enrollmentOpts} />
                </FIELD>
                <FIELD label="Rural / Urban">
                    <select value={data.institute_rural_urban_status || ''} onChange={e => set('institute_rural_urban_status')(e.target.value)}
                        className="select select-bordered w-full text-sm">
                        <option value="">Select…</option>
                        <option value="R">Rural</option>
                        <option value="U">Urban</option>
                    </select>
                </FIELD>
                <FIELD label="Total Seat Intake">
                    <INPUT type="number" value={data.totalseatIntake || ''} onChange={setInput('totalseatIntake')} />
                </FIELD>
            </Section>

            {/* Contact */}
            <Section title="Contact Details">
                <FIELD label="Primary Email">
                    <INPUT type="email" value={data.emailId || ''} onChange={setInput('emailId')} />
                </FIELD>
                <FIELD label="Alternate Email">
                    <INPUT type="email" value={data.altemailId || ''} onChange={setInput('altemailId')} />
                </FIELD>
                <FIELD label="Phone">
                    <INPUT value={data.phone || ''} onChange={setInput('phone')} />
                </FIELD>
                <FIELD label="Mobile No.">
                    <INPUT value={data.mobileno || ''} onChange={setInput('mobileno')} />
                </FIELD>
                <FIELD label="Fax">
                    <INPUT value={data.fax || ''} onChange={setInput('fax')} />
                </FIELD>
                <FIELD label="Contact Person">
                    <INPUT value={data.contactperson || ''} onChange={setInput('contactperson')} />
                </FIELD>
                <FIELD label="Designation">
                    <INPUT value={data.designation || ''} onChange={setInput('designation')} />
                </FIELD>
            </Section>

            {/* Location */}
            <Section title="Location">
                <FIELD label="State">
                    <select value={data.lgdstateId || ''} onChange={e => { set('lgdstateId')(e.target.value ? +e.target.value : null); set('lgddistrictId')(null); }}
                        className="select select-bordered w-full text-sm">
                        <option value="">Select State…</option>
                        {stateOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </FIELD>
                <FIELD label="District">
                    <SELECT value={data.lgddistrictId} onChange={set('lgddistrictId')} opts={districtOpts} placeholder="Select District…" />
                </FIELD>
                <div className="md:col-span-2">
                    <FIELD label="Address">
                        <textarea value={data.address || ''} onChange={setInput('address')}
                            className="textarea textarea-bordered w-full text-sm" rows={3} />
                    </FIELD>
                </div>
                <FIELD label="Pincode">
                    <INPUT value={data.pincode || ''} onChange={setInput('pincode')} maxLength={6} />
                </FIELD>
                <FIELD label="Latitude">
                    <INPUT value={data.latitude || ''} onChange={setInput('latitude')} />
                </FIELD>
                <FIELD label="Longitude">
                    <INPUT value={data.longitude || ''} onChange={setInput('longitude')} />
                </FIELD>
            </Section>

            {/* Placement & Training */}
            <Section title="Placement & Training">
                <FIELD label="Placement Cell Available?">
                    <RADIO value={data.is_placement_cell_available || 'N'} onChange={set('is_placement_cell_available')} label="" />
                </FIELD>
                <FIELD label="Training Offered?">
                    <RADIO value={data.is_institute_offerened_training || 'N'} onChange={set('is_institute_offerened_training')} label="" />
                </FIELD>
                <FIELD label="Placement Officer Mobile">
                    <INPUT value={data.placement_officer_contact_number || ''} onChange={setInput('placement_officer_contact_number')} />
                </FIELD>
                <FIELD label="Placement Officer Email">
                    <INPUT type="email" value={data.placement_officer_email_id || ''} onChange={setInput('placement_officer_email_id')} />
                </FIELD>
            </Section>
        </div>
    );
}

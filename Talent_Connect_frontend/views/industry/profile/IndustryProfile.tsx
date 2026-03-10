"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import api from "@/lib/api";
import SpinnerFallback from "@/components/Spinner";
import { 
  Building2, MapPin, Phone, Mail, Globe, 
  UserCircle, Briefcase, FileText, CheckCircle2,
  AlertCircle 
} from "lucide-react";

interface IndustryData {
  industry_id: number;
  industry_name: string;
  address: string;
  pincode: string;
  phone: string;
  emailId: string;
  url: string;
  contactperson: string;
  designation: string;
  mobileno: string;
  startup_recognised: string;
  industrylogo?: string;
  state?: { statename: string };
  district?: { districtname: string };
  industrySector?: { sectorname: string };
  industryScale?: { scalename: string };
  legalEntity?: { entityname: string };
}

export default function IndustryProfile() {
  const { user, loading: authLoading } = useAuth();
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    // We use the ID from the Auth context if available
    const industryId = user?.industry_id;

    if (!industryId) {
      setError("No Industry associated with your account.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Debug: Log info for console (User can check browser console)
        console.log("Fetching profile for Industry ID:", industryId);
        
        const response = await api.get(`/industry/${industryId}`);
        if (response.data) {
          setIndustryData(response.data);
        } else {
          setError("Industry details not found.");
        }
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
        const serverMsg = err.response?.data?.message || err.message;
        setError(`An error occurred: ${serverMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.industry_id, authLoading]);

  if (authLoading || loading) {
    return <SpinnerFallback />;
  }

  if (error || !industryData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 m-4 md:m-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Profile Unavailable</h3>
        <p className="text-slate-500 text-center max-w-sm">
          {error || "We couldn't retrieve your industry profile data at this time."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="h-40 md:h-52 bg-slate-900 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {/* Default Cover Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <div className="px-6 md:px-10 pb-10 relative -mt-16">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            
            {/* Logo Area */}
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 shrink-0">
              <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden relative text-slate-300">
                {industryData.industrylogo ? (
                   <img 
                     src={`data:image/jpeg;base64,${industryData.industrylogo}`} 
                     alt={industryData.industry_name}
                     className="object-cover w-full h-full"
                   />
                ) : (
                  <Building2 size={56} />
                )}
              </div>
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {industryData.industry_name}
                </h1>
                {industryData.startup_recognised === 'Y' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Startup
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                <MapPin size={14} className="text-primary" />
                {industryData.district?.districtname || 'N/A'}, {industryData.state?.statename || 'N/A'}
              </p>
            </div>
            
            <div className="md:w-auto w-full flex flex-col gap-3 md:pb-1">
               {industryData.url && (
                  <a href={industryData.url.startsWith('http') ? industryData.url : `https://${industryData.url}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 shadow-primary/20 active:scale-95 text-xs uppercase tracking-widest">
                    <Globe size={16} />
                    Company Website
                  </a>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              Organization Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
              <DetailItem 
                label="Industry Sector" 
                value={industryData.industrySector?.sectorname} 
              />
              <DetailItem 
                label="Industry Scale" 
                value={industryData.industryScale?.scalename} 
              />
              <DetailItem 
                label="Legal Entity" 
                value={industryData.legalEntity?.entityname} 
              />
              <DetailItem 
                label="Registration ID" 
                value={industryData.industry_id ? `IND-${industryData.industry_id.toString().padStart(6, '0')}` : null} 
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <MapPin size={20} />
              </div>
              Registered Office
            </h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
                <p className="font-bold text-slate-800 text-lg leading-relaxed mb-4">
                  {industryData.address || "Address details not provided."}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <DetailItem label="District" value={industryData.district?.districtname} />
                  <DetailItem label="State" value={industryData.state?.statename} />
                  <DetailItem label="Pincode" value={industryData.pincode} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/20 transition-colors" />
            
             <h2 className="text-lg font-black mb-8 flex items-center gap-3 uppercase tracking-widest text-primary">
              <UserCircle size={24} />
              POC Details
            </h2>
            
            <div className="space-y-8 relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Authority Name</p>
                <p className="font-bold text-white text-xl tracking-tight">{industryData.contactperson || 'N/A'}</p>
                {industryData.designation && (
                  <p className="text-xs text-primary font-black uppercase tracking-widest mt-1 opacity-80">
                    {industryData.designation}
                  </p>
                )}
              </div>

              <div className="h-px bg-white/10 w-full" />

              <div className="space-y-6">
                {industryData.mobileno && (
                   <ContactItem icon={Phone} label="Primary Mobile" value={industryData.mobileno} isDark />
                )}
                {industryData.emailId && (
                   <ContactItem icon={Mail} label="Official Email" value={industryData.emailId} isDark />
                )}
                {industryData.phone && (
                   <ContactItem icon={Phone} label="Office Extension" value={industryData.phone} isDark />
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1.5">{label}</p>
      <p className="font-bold text-slate-800 tracking-tight leading-tight">{value || <span className="text-slate-300 font-normal italic">Not Specified</span>}</p>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, isDark = false }: { icon: any, label: string, value: string, isDark?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border ${isDark ? 'bg-white/5 border-white/10 text-primary' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-[9px] font-black uppercase tracking-[0.15em] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <p className={`font-bold text-sm break-all ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</p>
      </div>
    </div>
  );
}

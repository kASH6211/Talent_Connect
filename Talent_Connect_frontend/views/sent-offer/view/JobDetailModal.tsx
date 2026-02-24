"use client";

import {
  X,
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

interface JobDetailModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  job?: any;
}

export default function JobDetailModal({
  open,
  setOpen,
  job,
}: JobDetailModalProps) {
  if (!open) return null;

  const dummyJob = {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    description:
      "We are looking for an experienced Frontend Developer to join our dynamic team and build scalable, modern UI systems.",
    salary: "$120,000 - $150,000",
    location: "Remote",
    type: "Full-time",
    postedDate: "2 days ago",
    applicants: 24,
    requirements: ["5+ years React", "Strong TypeScript", "Next.js experience"],
    benefits: ["Health insurance", "Remote work", "Flexible hours"],
  };

  const jobData = job || dummyJob;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .modal-bg {
          position: absolute;
          inset: 0;
          background: rgba(8, 6, 18, 0.55);
          backdrop-filter: blur(6px) saturate(1.4);
          -webkit-backdrop-filter: blur(6px) saturate(1.4);
        }

        .modal-card {
          position: relative;
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(245,246,255,0.97) 100%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow:
            0 0 0 1px rgba(99, 91, 255, 0.08),
            0 32px 80px rgba(10, 8, 40, 0.35),
            0 8px 24px rgba(10, 8, 40, 0.12);
          animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .modal-card::-webkit-scrollbar { width: 6px; }
        .modal-card::-webkit-scrollbar-track { background: transparent; }
        .modal-card::-webkit-scrollbar-thumb { background: rgba(99,91,255,0.2); border-radius: 3px; }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0,0,0,0.05);
          border: none;
          border-radius: 10px;
          padding: 7px;
          cursor: pointer;
          color: #777;
          transition: all 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .close-btn:hover { background: rgba(0,0,0,0.1); color: #111; transform: scale(1.05); }

        /* Header */
        .modal-header {
          padding: 36px 36px 28px;
          background: linear-gradient(135deg, #f0efff 0%, #e8f0ff 100%);
          border-radius: 24px 24px 0 0;
          border-bottom: 1px solid rgba(99,91,255,0.1);
          position: relative;
          overflow: hidden;
        }

        .modal-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(99,91,255,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .header-inner {
          display: flex;
          align-items: center;
          gap: 18px;
          position: relative;
        }

        .company-logo {
          background: linear-gradient(135deg, #635bff, #8b83ff);
          padding: 16px;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(99,91,255,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .job-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f0d2e;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }

        .company-name {
          font-size: 14px;
          color: #635bff;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
        }

        .badge {
          background: rgba(99,91,255,0.1);
          color: #635bff;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.3px;
        }

        /* Body */
        .modal-body {
          padding: 32px 36px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Info grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 600px) {
          .info-grid { grid-template-columns: repeat(2, 1fr); }
          .modal-header, .modal-body { padding-left: 20px; padding-right: 20px; }
          .footer-actions { flex-direction: column; }
        }

        .info-card {
          background: #fff;
          border: 1px solid rgba(99,91,255,0.1);
          border-radius: 14px;
          padding: 14px 16px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .info-card:hover {
          box-shadow: 0 4px 16px rgba(99,91,255,0.1);
          transform: translateY(-2px);
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #9d97c4;
          margin-bottom: 6px;
        }

        .info-value {
          font-size: 13px;
          font-weight: 700;
          color: #0f0d2e;
          font-family: 'Sora', sans-serif;
        }

        /* Section */
        .section-title {
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0f0d2e;
          margin: 0 0 10px;
          letter-spacing: -0.2px;
        }

        .description-text {
          font-size: 14px;
          line-height: 1.75;
          color: #555;
        }

        /* Lists */
        .lists-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 500px) { .lists-grid { grid-template-columns: 1fr; } }

        .list-section {
          background: #fafafe;
          border: 1px solid rgba(99,91,255,0.08);
          border-radius: 14px;
          padding: 18px;
        }

        .list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #444;
          padding: 6px 0;
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .list-item:last-child { border-bottom: none; padding-bottom: 0; }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #635bff, #8b83ff);
          margin-top: 5px;
          flex-shrink: 0;
        }

        /* Footer */
        .modal-footer {
          border-top: 1px solid rgba(99,91,255,0.08);
          padding-top: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .posted-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #999;
        }

        .footer-actions {
          display: flex;
          gap: 10px;
        }

        .btn-reject {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 22px;
          border-radius: 12px;
          border: 1.5px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.04);
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-reject:hover {
          background: rgba(239,68,68,0.1);
          border-color: #ef4444;
          transform: translateY(-1px);
        }

        .btn-accept {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 24px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #635bff, #8b83ff);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(99,91,255,0.35);
          transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-accept:hover {
          background: linear-gradient(135deg, #5045f0, #7a72f5);
          box-shadow: 0 6px 20px rgba(99,91,255,0.45);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="modal-backdrop">
        {/* Semi-transparent backdrop — background shows through */}
        <div className="modal-bg" onClick={() => setOpen(false)} />

        {/* Modal Card */}
        <div className="modal-card">
          {/* Close */}
          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>

          {/* Header */}
          <div className="modal-header">
            <div className="header-inner">
              <div className="company-logo">
                <Building2 size={26} color="#fff" />
              </div>
              <div>
                <h2 className="job-title">{jobData.title}</h2>
                <p className="company-name">
                  <Sparkles size={13} />
                  {jobData.company}
                  <span className="badge">Hiring</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Info Cards */}
            <div className="info-grid">
              <InfoCard icon={<DollarSign size={14} />} label="Salary" value={jobData.salary} />
              <InfoCard icon={<MapPin size={14} />} label="Location" value={jobData.location} />
              <InfoCard icon={<Briefcase size={14} />} label="Type" value={jobData.type} />
              <InfoCard icon={<Users size={14} />} label="Applicants" value={`${jobData.applicants}`} />
            </div>

            {/* Description */}
            <div>
              <h3 className="section-title">About the Role</h3>
              <p className="description-text">{jobData.description}</p>
            </div>

            {/* Requirements + Benefits */}
            <div className="lists-grid">
              <div className="list-section">
                <h3 className="section-title">Requirements</h3>
                {jobData.requirements.map((item: string, i: number) => (
                  <div className="list-item" key={i}>
                    <span className="dot" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="list-section">
                <h3 className="section-title">Benefits</h3>
                {jobData.benefits.map((item: string, i: number) => (
                  <div className="list-item" key={i}>
                    <span className="dot" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <div className="posted-info">
                <Clock size={14} />
                Posted {jobData.postedDate}
              </div>
              <div className="footer-actions">
                <button className="btn-reject" onClick={() => setOpen(false)}>
                  <XCircle size={16} />
                  Reject
                </button>
                <button className="btn-accept" onClick={() => setOpen(false)}>
                  <CheckCircle2 size={16} />
                  Accept Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="info-card">
      <div className="info-label">{icon}{label}</div>
      <div className="info-value">{value}</div>
    </div>
  );
}
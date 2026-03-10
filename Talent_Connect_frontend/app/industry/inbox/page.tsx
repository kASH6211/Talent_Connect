import ComingSoon from "@/components/ComingSoon";

export default function IndustryInboxFallbackPage() {
  return (
    <div className="p-4 md:p-8">
      <ComingSoon 
        title="Inbox" 
        description="We are currently building a messaging system to help you communicate with institutes and candidates directly." 
      />
    </div>
  );
}

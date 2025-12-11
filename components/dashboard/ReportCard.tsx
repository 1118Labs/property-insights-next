import PIButton from "@/components/ui/PIButton";
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

type IconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & RefAttributes<SVGSVGElement>>;

type ReportCardProps = {
  title: string;
  description: string;
  href: string;
  icon: IconType;
};

export default function ReportCard({ title, description, href, icon: Icon }: ReportCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <PIButton href={href} variant="secondary" className="w-full justify-center">
          Open Report
        </PIButton>
      </div>
    </div>
  );
}

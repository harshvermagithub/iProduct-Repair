'use client';
import SVGLoader from "@/components/ui/SVGLoader";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <SVGLoader className="w-full h-full" />
        </div>
    );
}

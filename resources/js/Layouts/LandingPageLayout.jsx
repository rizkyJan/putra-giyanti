import { Head } from "@inertiajs/react";
import Header from "@/Components/LandingPage/Header";
import Footer from "@/Components/LandingPage/Footer";

export default function LandingPageLayout({ title, children }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Head title={title} />

            <Header />

            <main className="flex-grow">{children}</main>

            <Footer />
        </div>
    );
}

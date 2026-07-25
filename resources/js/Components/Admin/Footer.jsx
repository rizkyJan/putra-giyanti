export default function Footer() {
    return (
        <footer className="bg-white p-4 text-center text-sm text-gray-500 shadow-inner mt-auto">
            &copy; {new Date().getFullYear()} Karang Taruna. Dibuat dengan React
            & Laravel.
        </footer>
    );
}

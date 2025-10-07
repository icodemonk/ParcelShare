import ParcelNav from "../../Componenet/ParcelNav.jsx";

function PSuggestion() {
    return (
        <>
            <ParcelNav />
            <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-indigo-600 mb-4">Suggestions</h1>
                    <p className="text-gray-700 text-lg">
                        Hello, I am the suggestion page. Feel free to share your ideas or feedback!
                    </p>
                </div>
            </main>
        </>
    );
}

export default PSuggestion;

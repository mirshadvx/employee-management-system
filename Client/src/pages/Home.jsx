import React from "react";
import Navbar from "../components/Navbar/Navbar";

const Home = () => {
    return (
        <div className="min-h-screen bg-[#E8DDD4]">
            <Navbar />

            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-[#3C4142] mb-6">Welcome to EMS</h1>
                    <p className="text-xl text-[#6B7D6A] mb-8 max-w-2xl mx-auto">
                        Manage employees, track details
                    </p>
                    <button
                        className="px-8 py-3 bg-[#8FA68E] text-white rounded-full 
                                         hover:bg-[#3C4142] transition-all duration-300 hover:scale-105
                                         shadow-lg hover:shadow-xl font-semibold"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;
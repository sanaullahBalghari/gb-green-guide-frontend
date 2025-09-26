import { Facebook, Instagram, Mountain, Twitter, Youtube } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-xl">
                                <Mountain className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">GB Green Guide</h3>
                                <p className="text-gray-400 text-sm">Discover Gilgit-Baltistan</p>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md">
                            Your ultimate guide to exploring the breathtaking beauty of Gilgit-Baltistan.
                            Discover local products, authentic experiences, and unforgettable adventures.
                        </p>
                        <div className="flex space-x-4">
                            <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            <Youtube className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cities</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Restaurants</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 GB Green Guide. All rights reserved. Promoting sustainable tourism in Gilgit-Baltistan.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
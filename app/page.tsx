"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, CheckCircle, List, Shield } from "lucide-react";

export default function Home() {
  const { isSignedIn } = useUser();

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Stay Organized",
      description: "Keep track of all your tasks in one place",
    },
    {
      icon: <List className="w-6 h-6" />,
      title: "Simple Interface",
      description: "Clean and intuitive design for better productivity",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure",
      description: "Your data is protected and private",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Navigation */}
      <nav className="p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TodoMaster
          </div>
          <div className="space-x-4">
            {isSignedIn ? (
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => (window.location.href = "/sign-in")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={() => (window.location.href = "/sign-up")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Master Your Tasks with Ease
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stay organized and boost your productivity with TodoMaster. The
            simple yet powerful todo list application for professionals.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            onClick={() =>
              (window.location.href = isSignedIn ? "/dashboard" : "/sign-up")
            }
          >
            {isSignedIn ? "Go to Dashboard" : "Get Started for Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white bg-opacity-50 backdrop-blur-sm border border-gray-200 hover:border-indigo-300 transition-all"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 border-t border-gray-200">
        <p>© 2024 TodoMaster. All rights reserved.</p>
      </footer>
    </div>
  );
}

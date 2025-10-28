"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { generateAIChatResponseAction } from "@/app/actions/generateAIChatResponse";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/lib/userProfile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({
    financialGoals: ["Build emergency fund", "Plan for retirement"],
    riskTolerance: "medium" as "low" | "medium" | "high",
    investmentExperience: "beginner" as
      | "beginner"
      | "intermediate"
      | "advanced",
    monthlyIncome: "",
    monthlyExpenses: "",
    age: "",
    occupation: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const goals: Goal[] = [
    {
      id: "budget-planning",
      title: "Budget Planning",
      description: "Get personalized budget recommendations",
      prompt:
        "Help me create a comprehensive budget plan based on my income and expenses. Analyze my spending patterns and suggest realistic budget allocations for different categories.",
    },
    {
      id: "debt-management",
      title: "Debt Management",
      description: "Strategies to pay off debt faster",
      prompt:
        "I need help managing my debt. Analyze my financial situation and provide strategies to pay off debt faster, including debt consolidation options and payment prioritization.",
    },
    {
      id: "investment-advice",
      title: "Investment Advice",
      description: "Investment strategies and portfolio building",
      prompt:
        "Help me understand investment options suitable for my financial goals. Provide guidance on portfolio diversification, risk management, and long-term wealth building strategies.",
    },
    {
      id: "saving-strategies",
      title: "Saving Strategies",
      description: "Tips to increase savings rate",
      prompt:
        "Analyze my spending habits and provide specific strategies to increase my savings rate. Include tips on reducing expenses and increasing income.",
    },
    {
      id: "financial-goals",
      title: "Financial Goals",
      description: "Set and track financial milestones",
      prompt:
        "Help me set realistic financial goals and create a roadmap to achieve them. Include short-term and long-term goal planning with actionable steps.",
    },
    {
      id: "expense-optimization",
      title: "Expense Optimization",
      description: "Reduce unnecessary spending",
      prompt:
        "Review my expense patterns and identify areas where I can reduce spending without compromising my lifestyle. Provide specific recommendations for cost-cutting.",
    },
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
      if (!profile || !profile.monthlyIncome) {
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const t = useTranslations("ai");

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    const newMessage: Message = {
      id: `goal-${Date.now()}`,
      role: "user",
      content: goal.prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    handleSendMessage(goal.prompt);
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await generateAIChatResponseAction(
        messageToSend,
        userProfile,
        conversationHistory
      );
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedGoal(null);
  };

  const handleProfileSubmit = async () => {
    try {
      const profileData = {
        ...profileForm,
        monthlyIncome: profileForm.monthlyIncome
          ? parseFloat(profileForm.monthlyIncome)
          : undefined,
        monthlyExpenses: profileForm.monthlyExpenses
          ? parseFloat(profileForm.monthlyExpenses)
          : undefined,
        age: profileForm.age ? parseInt(profileForm.age) : undefined,
      };

      const updatedProfile = await updateUserProfile(profileData);
      setUserProfile(updatedProfile);
      setShowProfileSetup(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const addFinancialGoal = () => {
    setProfileForm((prev) => ({
      ...prev,
      financialGoals: [...prev.financialGoals, ""],
    }));
  };

  const updateFinancialGoal = (index: number, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.map((goal, i) =>
        i === index ? value : goal
      ),
    }));
  };

  const removeFinancialGoal = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-sm sm:text-lg">🤖</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {t("chatTitle")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t("chatSubtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfileSetup(true)}
            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-colors duration-200"
          >
            Profile
          </button>
          <button
            onClick={clearChat}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors duration-200"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Set Up Your Financial Profile
            </h3>

            <div className="space-y-4">
              {/* Financial Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Financial Goals
                </label>
                {profileForm.financialGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) =>
                        updateFinancialGoal(index, e.target.value)
                      }
                      placeholder={
                        t("goalInputPlaceholder") ?? "Enter a financial goal"
                      }
                      className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={() => removeFinancialGoal(index)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFinancialGoal}
                  className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm"
                >
                  + Add Goal
                </button>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Tolerance
                </label>
                <select
                  value={profileForm.riskTolerance}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      riskTolerance: e.target.value as
                        | "low"
                        | "medium"
                        | "high",
                    }))
                  }
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              {/* Investment Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Experience
                </label>
                <select
                  value={profileForm.investmentExperience}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      investmentExperience: e.target.value as
                        | "beginner"
                        | "intermediate"
                        | "advanced",
                    }))
                  }
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  value={profileForm.monthlyIncome}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      monthlyIncome: e.target.value,
                    }))
                  }
                  placeholder="Enter your monthly income"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Monthly Expenses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Expenses (₹)
                </label>
                <input
                  type="number"
                  value={profileForm.monthlyExpenses}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      monthlyExpenses: e.target.value,
                    }))
                  }
                  placeholder="Enter your monthly expenses"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={profileForm.age}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, age: e.target.value }))
                  }
                  placeholder="Enter your age"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={profileForm.occupation}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                  placeholder="Enter your occupation"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProfileSubmit}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                Save Profile
              </button>
              <button
                onClick={() => setShowProfileSetup(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Section */}
      {messages.length === 0 && (
        <div className="p-4 sm:p-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Choose a financial goal to get started:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleGoalClick(goal)}
                className="p-3 text-left bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">
                      {goal.id === "budget-planning" && "💰"}
                      {goal.id === "debt-management" && "📊"}
                      {goal.id === "investment-advice" && "📈"}
                      {goal.id === "saving-strategies" && "💎"}
                      {goal.id === "financial-goals" && "🎯"}
                      {goal.id === "expense-optimization" && "✂️"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {goal.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl ${
                message.role === "user"
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === "assistant" && (
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🤖</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-emerald-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">🤖</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("typeMessage")}
            className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            <span className="text-sm">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

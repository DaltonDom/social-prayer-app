"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  MessageCircle,
  RefreshCw,
  Bookmark,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";

export default function GroupDetailsPage({
  params,
}: {
  params?: { id?: string },
}) {
  const [isJoined, setIsJoined] = useState(false);

  // Use a default ID if params.id is undefined
  const groupId = params?.id || "default";

  // Mock data for the group
  const group = {
    id: groupId,
    name: "WBL",
    subtitle: "White lake",
    image: "/placeholder.svg",
    stats: {
      members: 1,
      prayers: 1,
    },
    owner: {
      name: "Dalton Domenighi",
      avatar: "/placeholder.svg",
      role: "Admin",
    },
    prayers: [
      {
        id: 1,
        author: "Jane Doe",
        avatar: "/placeholder.svg",
        title: "Upcoming Job Interview",
        content:
          "Please pray for my upcoming job interview. I'm nervous but hopeful.",
        date: "2 hours ago",
        category: "Career",
        comments: 2,
        updates: 0,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-indigo-600 text-lg flex items-center font-medium transition-colors hover:text-indigo-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="text-gray-900 text-xl font-semibold">Group Details</h1>
          <div className="w-14"></div> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Group Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col items-center">
            <Avatar className="w-28 h-28 border-4 border-indigo-100 bg-gradient-to-br from-indigo-400 to-purple-500">
              <AvatarImage
                src={group.image}
                alt={group.name}
                className="object-cover"
              />
              <AvatarFallback>{group.name}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-gray-900 text-2xl font-bold">
              {group.name}
            </h2>
            <p className="text-gray-500 text-lg">{group.subtitle}</p>

            {/* Stats */}
            <div className="flex justify-center gap-16 mt-6">
              <div className="text-center">
                <p className="text-indigo-600 text-3xl font-semibold">
                  {group.stats.members}
                </p>
                <p className="text-gray-500">Members</p>
              </div>
              <div className="text-center">
                <p className="text-indigo-600 text-3xl font-semibold">
                  {group.stats.prayers}
                </p>
                <p className="text-gray-500">Prayers</p>
              </div>
            </div>

            {/* Join Group Button */}
            <Button
              className={`mt-6 w-full max-w-xs text-white ${
                isJoined
                  ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              }`}
              onClick={() => setIsJoined(!isJoined)}
            >
              {isJoined ? "Leave Group" : "Join Group"}
            </Button>
          </div>

          {/* Owner Section */}
          <div className="mt-8">
            <h3 className="text-gray-900 text-xl font-semibold mb-4">Owner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-indigo-100 bg-gradient-to-br from-indigo-400 to-purple-500">
                  <AvatarImage
                    src={group.owner.avatar}
                    alt={group.owner.name}
                  />
                  <AvatarFallback>
                    {group.owner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-900 font-medium">
                  {group.owner.name}
                </span>
              </div>
              <span className="text-indigo-600 font-medium">
                {group.owner.role}
              </span>
            </div>
          </div>
        </div>

        {/* Prayer Requests Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-900 text-xl font-semibold">
              Prayer Requests
            </h3>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Prayer
            </Button>
          </div>

          {group.prayers.length > 0 ? (
            <div className="space-y-4">
              {group.prayers.map((prayer) => (
                <Card
                  key={prayer.id}
                  className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                >
                  <CardHeader className="relative pb-0">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-500 ring-offset-2 ring-offset-purple-50 dark:ring-offset-gray-800">
                        <AvatarImage src={prayer.avatar} alt={prayer.author} />
                        <AvatarFallback>
                          {prayer.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold leading-none">
                          {prayer.author}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {prayer.date}
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 p-4">
                        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 px-3 py-1 text-xs font-medium text-purple-800 dark:text-purple-200">
                          <Bookmark className="h-3.5 w-3.5 mr-1" />
                          {prayer.category}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {prayer.title}
                    </h3>
                    <p className="text-sm leading-relaxed">{prayer.content}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-sm text-muted-foreground bg-gray-50/50 dark:bg-gray-800/50 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 dark:text-purple-400"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {prayer.comments} Comments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {prayer.updates} Updates
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-white rounded-lg shadow-inner">
              <p className="text-gray-500 text-lg">
                No prayers in this group yet
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

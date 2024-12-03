"use client";

import { ArrowLeft, Home, MessageCircle, RefreshCw, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function PrayerDetails() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-md mx-auto px-4 pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="#"
              className="flex items-center text-purple-600 dark:text-purple-400 font-medium"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <h1 className="text-xl font-semibold">Prayer Details</h1>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-6 mt-6">
          {/* Prayer Card */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 backdrop-blur-sm">
            <CardHeader className="relative pb-0">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-purple-500 ring-offset-2 ring-offset-purple-50 dark:ring-offset-gray-800">
                  <AvatarImage src="/placeholder.svg" alt="Dalton Domenighi" />
                  <AvatarFallback>DD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold leading-none">
                    Dalton Domenighi
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    2024-11-23
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-semibold">No com</h3>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 px-3 py-1 text-xs font-medium text-purple-800 dark:text-purple-200">
                  <Home className="h-3.5 w-3.5 mr-1" />
                  Family
                </span>
              </div>
              <p className="text-sm leading-relaxed">Comment</p>
            </CardContent>
          </Card>

          {/* Updates Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold px-1">Updates</h2>
            <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-6 text-center text-muted-foreground">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 opacity-50" />
                No updates yet
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold px-1">Comments</h2>
            <Card className="border-0 shadow-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt="Dalton Domenighi"
                    />
                    <AvatarFallback>DD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Dalton Domenighi
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        11/22/2024
                      </span>
                    </div>
                    <p className="text-sm mt-1">Djkh</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comment Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t dark:border-gray-800 p-4">
          <div className="container max-w-md mx-auto flex items-center gap-2">
            <Input
              placeholder="Add a comment..."
              className="flex-1 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-full"
            />
            <Button
              size="icon"
              className="rounded-full bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send comment</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

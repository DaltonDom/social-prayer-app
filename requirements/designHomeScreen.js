"use client";

import { useState } from "react";
import {
  Bell,
  Book,
  Home,
  Plus,
  Users2,
  User,
  Search,
  Filter,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const posts = [
    {
      id: 1,
      author: "Dalton Domenighi",
      date: "2024-11-23",
      category: "No com",
      icon: Home,
      content: "Comment",
      comments: 1,
      updates: 0,
    },
    {
      id: 2,
      author: "Dalton Domenighi",
      date: "2024-11-23",
      category: "Sequins",
      icon: Users2,
      content: "Hulking",
      comments: 0,
      updates: 0,
    },
    {
      id: 3,
      author: "Dalton Domenighi",
      date: "2024-11-20",
      category: "Rehash",
      icon: Book,
      content: "Fhfb",
      comments: 1,
      updates: 0,
    },
  ];

  const filteredPosts = posts.filter(
    (post) =>
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-md mx-auto px-4 pb-24">
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 py-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Tefillah
            </h1>
            <div className="flex items-center space-x-2">
              <Button size="icon" variant="ghost" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Filter className="h-5 w-5" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Latest</DropdownMenuItem>
                  <DropdownMenuItem>Most Comments</DropdownMenuItem>
                  <DropdownMenuItem>Most Updates</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              <CardHeader className="relative pb-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-purple-500 ring-offset-2 ring-offset-purple-50 dark:ring-offset-gray-800">
                    <AvatarImage src="/placeholder.svg" alt={post.author} />
                    <AvatarFallback>
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold leading-none">
                      {post.author}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.date}
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 p-4">
                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 px-3 py-1 text-xs font-medium text-purple-800 dark:text-purple-200">
                      <post.icon className="h-3.5 w-3.5 mr-1" />
                      {post.category}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{post.content}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between text-sm text-muted-foreground bg-gray-50/50 dark:bg-gray-800/50 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 dark:text-purple-400"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments} Comments
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 dark:text-blue-400"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {post.updates} Updates
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Floating Action Button */}
        <Button
          size="icon"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-110"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add new item</span>
        </Button>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t dark:border-gray-800 py-2">
          <div className="container max-w-md mx-auto px-6">
            <div className="flex items-center justify-around">
              <NavItem href="#" icon={Home} label="Home" active />
              <NavItem href="#" icon={Users2} label="Groups" />
              <div className="w-5" /> {/* Spacer for FAB */}
              <NavItem href="#" icon={Book} label="Journal" />
              <NavItem href="#" icon={User} label="Profile" />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active = false }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
        active
          ? "text-purple-600 dark:text-purple-400"
          : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Link>
  );
}

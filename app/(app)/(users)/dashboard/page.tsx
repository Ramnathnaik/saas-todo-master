"use client";
import {
  addTodo,
  deleteTodo,
  updateTodo,
  fetchTodos,
} from "@/app/utils/handlers/apiHandlers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { Check, Circle, Trash2 } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";

const UserDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const queryClient = useQueryClient();

  const {
    data: { todos = [], totalPages = 1 } = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todos", { currentPage }, { debouncedSearchTerm }],
    queryFn: () => fetchTodos(currentPage, debouncedSearchTerm),
    staleTime: 0,
  });

  // useMutation hook to add new todos
  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      await addTodo(title);
    },
    onSuccess: () => {
      console.log("Todo added");
      queryClient.invalidateQueries({
        queryKey: ["todos", { currentPage }, { debouncedSearchTerm }],
      });
      setNewTodoTitle(""); // Clear input field
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error adding todo:", error);
    },
  });

  const handleAddTodo = (title: string) => {
    addMutation.mutate(title);
  };

  // useMutation hook to delete todos
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteTodo(id);
    },
    onSuccess: () => {
      console.log("Todo deleted");
      queryClient.invalidateQueries({
        queryKey: ["todos", { currentPage }, { debouncedSearchTerm }],
      });
    },
  });

  const handleDeleteTodo = (id: number) => {
    deleteMutation.mutate(id);
  };

  // useMutation hook to update todos
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      title,
      completed,
    }: {
      id: number;
      title: string;
      completed: boolean;
    }) => updateTodo(id, title, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos", { currentPage }, { debouncedSearchTerm }],
      });
    },
  });

  const handleUpdateTodo = (id: number, title: string, completed: boolean) => {
    updateMutation.mutate({ id, title, completed });
  };

  if (isError) {
    return (
      <div className="container mx-auto my-8 px-10">
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="max-w-md py-8 px-4 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-lg text-gray-700 mb-6">
              Something went wrong while loading todos. Please try again later.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="destructive"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-10">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <Input
        type="text"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
        placeholder="Search todos"
        className="mb-4"
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4" onClick={() => setIsDialogOpen(true)}>
            Add Todo
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Todo</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Enter todo title"
            className="mb-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => handleAddTodo(newTodoTitle)}
              variant="default"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="flex flex-col items-center p-8 bg-white shadow-lg rounded-lg">
            <div className="loader mb-4"></div>{" "}
            <h1 className="text-2xl font-bold text-gray-700 mb-2">
              Loading...
            </h1>
            <p className="text-lg text-gray-500">
              Please wait while we load your todos.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <Card className="w-full mx-auto">
            <CardContent className="p-4">
              <div className="space-y-4">
                {todos?.length > 0 ? (
                  todos.map(
                    (todo: {
                      id: number;
                      title: string;
                      completed: boolean;
                    }) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleUpdateTodo(
                                todo.id,
                                todo.title,
                                !todo.completed
                              )
                            }
                          >
                            {todo.completed ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                          <span
                            className={`${
                              todo.completed
                                ? "line-through text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {todo.title}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:text-red-500"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No todos yet! Add some tasks to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {todos?.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  >
                    Previous
                  </PaginationPrevious>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-disabled={currentPage >= totalPages}
                    tabIndex={currentPage >= totalPages ? -1 : undefined}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  >
                    Next
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

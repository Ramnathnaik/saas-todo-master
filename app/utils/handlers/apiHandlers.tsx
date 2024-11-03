"use client";

export const fetchTodos = async (page: number, searchTerm: string) => {
  const response = await fetch(
    "/api/todos?page=" + page + "&searchTerm=" + searchTerm
  );
  const todos = await response.json();
  return todos;
};

export const fetchSubscriptionStatus = async () => {
  const response = await fetch("/api/subscription");
  const subscriptionStatus = await response.json();
  return subscriptionStatus;
};

export const addTodo = async (title: string) => {
  return await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
};

export const updateTodo = async (
  id: number,
  title: string,
  completed: boolean
) => {
  await fetch("/api/todos/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, completed }),
  });
};

export const deleteTodo = async (id: number) => {
  return await fetch("/api/todos/" + id, {
    method: "DELETE",
  });
};

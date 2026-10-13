import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost/seu_backend",
  headers: {
    "Content-Type": "application/json",
  },
});
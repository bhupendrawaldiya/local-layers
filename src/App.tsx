
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";
import ProductDetails from "@/pages/ProductDetails";
import Wishlist from "@/pages/Wishlist";
import Products from "@/pages/Products";
import Messages from "@/pages/Messages";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import CategoryProducts from "./components/CategoryProducts";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/account/*" element={<Account />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/products" element={<Products />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/products/:category" element={<CategoryProducts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

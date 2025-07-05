import React, { useState } from "react";
import { useTheme } from "./ThemeProvider"; // <-- add this
import { useLocation } from "react-router-dom"; // <-- add this

const Header = ({ 
    isLoggedIn = false, 
    userAvatar, 
    userName = "John Doe" }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setUserMenuOpen] = useState(false)
    const { theme, setTheme } = useTheme()
    const location = useLocation()

    const navigationLinks = [
        { href: "/", label: "Home" },
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        ...(isLoggedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ]

    const isActivateLink = (href) => {
        if (href === "/") return location.pathname === "/"
        return location.pathname.startsWith(href)
    }

    return (
        <h1>Hello World</h1>
    )
}

export default Header
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, LogOut, FileText, LogIn, UserPlus } from "lucide-react"
import { signInWithGoogle, useAuth } from "@/lib/api"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function Profile() {
  const { user, isAuthenticated, loading } = useAuth()
  const [openAuth, setOpenAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      if (result?.user) {
        setOpenAuth(false)
      }
    } catch (error) {
      console.error("Google sign-in failed:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleEmailAuth = () => {
    // TODO: Replace with real Firebase email/password auth
    if (isSignUp) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!")
        return
      }
    }
    setOpenAuth(false)
  }

  if (loading) {
    return <p>Loading...</p> // or a spinner
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 rounded-full">
            <Avatar className="h-8 w-8">
              {isAuthenticated && user ? (
                <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? "User"} />
              ) : (
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {isAuthenticated && user ? (
            <>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user.displayName ?? "User"}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Itineraries
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => { setIsSignUp(false); setOpenAuth(true) }}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setIsSignUp(true); setOpenAuth(true) }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Auth Modal */}
      <Dialog open={openAuth} onOpenChange={setOpenAuth}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isSignUp ? "Sign Up" : "Sign In"}</DialogTitle>
            <DialogDescription>
              {isSignUp ? "Create a new account" : "Access your account"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {/* Submit */}
            <Button onClick={handleEmailAuth}>
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            {/* Google Sign-in */}
            <div className="flex items-center justify-center">
              <Button variant="outline" onClick={handleGoogleSignIn} className="w-full">
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  className="h-5 w-5 mr-2"
                />
                Continue with Google
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* eslint-disable react/prop-types */
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { showToast } from "@/components/CustomToast"
import axiosInstance from "@/helper/axios"

const FormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginForm({ flip }) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/v1/user/login", {
        email: data.email,
        password: data.password,
      })
      localStorage.setItem("token", response.data.token)
      showToast("success", "Sign in successful", "Welcome back!");
      
      navigate("/dashboard")
      window.location.reload()
    } catch (error) {
      showToast("danger", "Sign in failed", error.response?.data?.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center mb-6">
          <img src="/logo.png" alt="MyApp Logo" className="h-14 sm:h-18 w-auto pt-2 mr-5" />
          <img src="/logo.png" alt="MyApp Logo" className="h-14 sm:h-18 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500">Sign in to your account</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-1">Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => {
              const [showPassword, setShowPassword] = useState(false)

              return (
                <FormItem>
                  <FormLabel className="text-gray-700 flex items-center gap-1">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="pl-10 pr-10"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )
            }}
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:primary-tc"
              />
              Remember me
            </label>
            {/* <a href="#" className="text-indigo-600 hover:underline">
              Forgot password?
            </a> */}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full relative primary-bg"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="animate-spin mr-2 h-5 w-5" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Switch to sign up */}
      <p className="text-center text-sm text-gray-600">
        Not a member?{" "}
        <span
          onClick={flip}
          className="font-medium primary-tc hover:underline cursor-pointer"
        >
          Sign up now
        </span>
      </p>
    </div>
  )
}
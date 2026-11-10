import { RouteText } from "@/features/i18n/language-provider";
import { SignupForm } from "@/features/signup/signup-form";

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold"><RouteText name="signup" /></h1>
      <SignupForm />
    </>
  );
}

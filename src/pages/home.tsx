import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user"

function HomePage() {
  const { token, logout } = useUser();

  return (
    <div className="w-full">
      {token}
      <Button onClick={logout}>
        Logout
      </Button>
    </div>
  )
}

export default HomePage;

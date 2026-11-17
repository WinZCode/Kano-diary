/*
 * Nút đăng xuất — form gọi thẳng Server Action, chạy được cả khi JavaScript chưa tải xong.
 */
import { Button } from "@/components/ui";
import { signOut } from "../actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="danger">
        Đăng xuất
      </Button>
    </form>
  );
}

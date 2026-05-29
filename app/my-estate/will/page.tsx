import { redirect } from "next/navigation";

// The will now lives at /will (review & generate at /will/create). Kept as a
// redirect for any old links into the retired linear setup flow.
export default function MyEstateWillRedirect() {
  redirect("/will");
}

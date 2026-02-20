import puter from "@heyputer/puter.js";

export const SignIn = async () => puter.auth.signIn();
export const SignOut = () => puter.auth.signOut();
export const GetCurrentUser = async () => {
  try {
    return await puter.auth.getUser();
  } catch (error) {
    return null;
  }
};

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/redux/authSlice";
import commentReducer from "../features/comment/redux/commentSlice";
import documentReducer from "../features/document/redux/documentSlice";
import usersReducer from "../features/user/redux/usersSlice";
import workspaceReducer from "../features/workspace/redux/workspaceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    document: documentReducer,
    users: usersReducer,
    workspace: workspaceReducer,
    comment: commentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

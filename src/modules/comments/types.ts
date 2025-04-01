import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type CommentsGetMantOutput = inferRouterOutputs<AppRouter>['comments']['getMany'];

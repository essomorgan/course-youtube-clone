import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type VideoGetOneOutput = inferRouterOutputs<AppRouter>['videos']['getOne'];
/* TBD: change to videos getMany */
export type VideoGetManyOutput = inferRouterOutputs<AppRouter>['suggestions']['getMany'];
This is a [Next.js](https://nextjs.org) project from Antonio's [clone youtube ](https://www.youtube.com/watch?v=ArmPzvHTcfQ) course.

(Part 1)
- 01 Setup
	- Configure environment
		- runtime(Node.js or **☑️Bun**)
    - package manager(npm, pnpm, yarn, **☑️bun**)
  - Why bun?
    - You will get the same environment as I do
    - Easily run Typescript scripts with ES6 imports
    - Less issues with dependency issues regarding React 19
      - (npm throws an error, yarn throws a warning, bun simply works)
  - Establish basic Bun commands
    - bun add === npm install
    - bunx === npx
- 02 Basic layout
  - Add logo asset
  - Learn basic app router folders
  - Sidebar component
    - Sidebar sections
    - Sidebar items
  - Navbar
    - Search input
    - Sign-in component 
- 03 Authentication
  - Integrate clerk
  - Add Sign-in screens
  - Add UserButton
  - Add middleware
  - Use auth state on sidebar sections
  - Protect routes
- 04 Database setup
  - Configure database
    - Create a [PostgreSQL database](www.neon.tech)
    - Setup DrizzleORM
    - Create schema - users
    - Migrate changes to database
  - Learn how to use drizzle-kit
  - Why DrizzleORM?
    - Only ORM with both reational and SQL-like query APIs
    - Serverless by default
    - Forcing us to **understand** our queries
- 05 Webhook sync
  - Create ngrok account (or any other local tunnel solution)
  - Obtain a static domain (not required, but easier development)
  - Add script to concurrently run local tunnel & app
  - Create the users webhook
  - Connect the webhook on Clerk dashboard
- 06 tPRC setup
  - Why tPRC?
    - end to end typesafety
    - familiar hooks (useQuery, useMutation, etc.)
    - v11 allows us to do authenticated prefetching
  - Why not X?
    - not possible to prefetch authenticated queries
  - Why prefetch?
    - **render as you fetch** concept
    - leverage RSCS as **loaders**
    - faster laod time
    - parallel data loading
- 07 tPRC configuration
  - Enable transformer on tRPC
  - Add auth to tRPC context
  - Add protectedProcedure
  - Add rate limiting
- 08 Video categories
  - Create schema - categories
  - Push changes to database
  - Seed categories
  - Prefetch categories
  - Create categories component
- 09 Studio layout
  - Create studio route group
  - Create studio layout
  - Protect studio routes
- 10 Studio videos
  - Create videos schema
  - Push database changes
  - Create studio procedures
  - Add video record creation
- 11 Infinite loading
  - Add suspense and error boundaries
  - Create reuseable InfiniteScroll component
  - Demonstrate infinite scroll
- 12 Mux integration
  - Create a responsive dialog
  - Create a free Mux account (credit card **NOT** required.)
  - Get a [15-second video](https://tinyurl.com/newtube-clip) with english audio
  - Create an upload modal
- 13 Mux webhooks
  - Update video schema
  - Push database changes
  - Handle "video.asset.ready" event (assign thumbnail & preview)
  - Handle "video.asset.error" event (update status)
  - Handle "video.asset.deleted" event (delete from database)
  - Handle "video.asset.track.ready' event (update trackId and trackStatus)
- 14 Video form
  - Add skeleton to videos-section
  - Create video form page
  - Add ability to update video information (title, description, category, visibility)
- 15 Video thumbnails
  - Integrate UploadThing (a service for better file uploads)
  - Add thumbnail upload/restore functionality
  - Refactor thumbnail fields in the schema (Proper UploadThing cleanup)
- 16 AI background jobs
  - Why we need background jobs?
    - avoid timeout from long-running tasks (problematic with AI generations)
    - ensures retries in case of failure
  - Integrate Upstash workflow
  - Trigger a background job
  - Setup OpenAI SDK (credit card required, no free trail & credits)
  - Add background jobs (generate title, description & thumbnail)
- 18 Video Page
  - Create video "getOne" procedure
    - Inner-join "user" (author information)
  - Prefetching process
  - Video section
  - Comments section (placeholder)
  - Suggestions section
- 19 Video views
  - Create video views schema
  - Combine video views for "getOne" videos procedure
  - Create video views creation procedure
  - Trigger video view creaction on video play
- 20 Video reactions
  - Create video reactions schema
  - Combine video reactions for "getOne" videos procedure
  - Create video reactions like & dislike procedure
  - Connect VideoReactions component with new API
- 21 Subscriptions
  - Create subscriptions schema
  - Combine subscriptiosn for "getOne" videos procedure
  - Create subscriptions procedures
  - Connect subscirptionButton component with new API
- 22 Comments
  - Create comments shcema
  - Create comments procedures
  - Create comments section
- 23 Comments infinite loading
  - Modify comments "getMany" procedure
  - Change prefetch() to prefetchInfinite()
  - Change suspense() to useSuspenseInfiniteQuery()
  - Add InfiniteLoading component
- 24 Comment reactions
  - Add "commentReactions" schema
  - Create comment reactions UI
  - Combine "commentReactions" with comments "getMany" procedure
  - Add InfiniteLoading component
- 25 Comment replies
  - Extend comment shcema by adding "parentId" foreign key
  - Create UI for replies
  - Modify comments "getMnay" procedure by combining parentId
  - Create variants for "CommentItem" component
  - Create variants for "CommentForm" component
  - Create CommentReplies component
- 26 Suggestions
  - Create suggestions procedure
  - Prefetch suggestions
  - Create VideoRowCard & VideoGridCard components
  - Connect Suggestions section with new API
- 27 Search Results
  - Add manual video re-validation
    - in case webhooks failed
    - in case webhooks fire out of order
  - Add proper categoryId query to suggestions
  - Create search procedure
  - Create search page
  - Prefetch search page
  - Connect search section to API
- 28 Improvements
  - Resolve complex "VERCEL_URL" env usage
  - Fix unique constraint issue with manual video revalidation
  - Add skeleton to search page
  - Add default values to SearchInput compoent
- 29 Home feed
  - Create videos procedures
  - Add Home page
  - Add Trending page
  - Add Subscriptions page
- 30 Playlists
  - Create playlists proccedures
  - Create Hisotry & Liked videos pages
- 31 Custom playlists
  - Create playlists schema
  - Create playlists procedures
  - Create playlists page
- 32 Populating playlists
  - Create PlaylistAddModal component
  - Create "getManyForVideo" playlist procedure
  - Create add and remove procedure playlist procedures for playlists
- 33 Individual playlist
  - Create "getVideos" procedure to load custom playlist's videos
  - Build custom playlist page
  - Add ability to delete a playlist
  - Add ability to remove a video from a palylist
- 34 User page
  - Add "bannerUrl" and "bannerKey" to user schema
  - Create "users.getOne" procedure
  - Modify "videos.getMany" procedure to accept userId prop
  - Create userId page
- 35 Banner upload
  - Implement "bannerUploader" in uploadthing/core.ts
  - Create BannerUploadModal
- 36 Subscriptions list
  - Create subscriptions "getMany" procedure
  - Load recent subscriptiosn in sidebar
  - Create all subscriptions page
- 37 Final improvemnts
  - Improve responsive navbar
  ~~- Protect "videos.getOne" if not public~~
  - Conclude "groupBy" debate
  ~~- Add laoding.tsx pages (Next.js optimizes for loading.tsx)~~

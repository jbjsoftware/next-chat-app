// import ChatContainer from "@/components/chat/chat-container";
import ChatPage from "@/components/chat/chat-ui";
// import { ModeToggle } from "@/components/theme-toggle";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { BrainCog, Sparkles, User } from "lucide-react";

// export default function Home() {
//   return (
//     <SidebarProvider>
//       <div className="flex-fill flex w-full">
//         <Sidebar>
//           <SidebarHeader className="border-b">
//             <Button variant="ghost" className="w-full justify-start gap-2">
//               <Sparkles className="h-4 w-4" />
//               New Chat
//             </Button>
//           </SidebarHeader>
//           <SidebarContent>
//             <div className="flex-1" />
//           </SidebarContent>
//         </Sidebar>
//         <SidebarInset className="flex w-full flex-col">
//           <div className="flex items-center gap-2 px-4 py-2">
//             <SidebarTrigger />

//             <h1 className="hidden text-2xl font-bold md:block">Chat</h1>

//             <BrainCog />

//             <div className="flex-fill"></div>

//             <div className="flex items-center">
//               <ModeToggle />
//             </div>

//             <Avatar className="cursor-pointer">
//               <AvatarFallback className="bg-slate-700 text-white">
//                 <User />
//               </AvatarFallback>
//             </Avatar>
//           </div>
//           <ChatContainer />
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   );
// }

export default function Home() {
  return <ChatPage />;
}

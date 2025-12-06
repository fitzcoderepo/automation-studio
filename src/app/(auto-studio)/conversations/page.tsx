import { prisma } from "@/lib/prisma";
import type { Conversation, Message } from "@prisma/client";

type ConversationWithLastMessage = Conversation & {
    lastMessage?: Message | null;
};

export default async function ConversationsPage() {
    // get conversations with their last latest message
    const conversations = (await prisma.conversation.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    })) as (Conversation & { messages: Message[] })[];
            
        
    const convosWithLast: ConversationWithLastMessage[] = conversations.map((convo) => ({
        ...convo,
        lastMessage: convo.messages[0] ?? null,    
    }));


    return (
      <>
        <h1 className="text-2xl text-left font-bold mb-6">Conversations</h1>

        {convosWithLast.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No conversations yet. Start chatting on the AI Chatbot page.
          </p>
        ) : (
          <div>
            <table className="table-auto border border-separate border-slate-700 ">
              <thead>
                <tr >
                  <th className=" text-center font-medium">ID</th>
                  <th className="text-left font-medium">Last Message</th>
                  <th className="text-left font-medium">Created</th>
                  <th className="text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {convosWithLast.map((convo) => (
                  <tr key={convo.id}>
                    <td className="px-4 py-2 text-xs text-center text-slate-300"> 
                      <a href={`/conversations/${convo.id}`} className="hover hover:text-white">{convo.id}</a> 
                    </td>
                    
                    <td className="px-4 py-2">
                      {convo.lastMessage
                        ? `${convo.lastMessage.role}: ${convo.lastMessage.content.slice(
                            0,
                            80
                          )}${convo.lastMessage.content.length > 80 ? "..." : ""}`
                        : "No messages"}
                    </td>
                    <td className="px-4 py-2">
                      {convo.createdAt.toLocaleString()}
                    </td>
                    <td>
                      <a href={`/chatbot?conversationId=${convo.id}`} className="text-blue-500 hover:underline text-sm">
                          Continue in chat
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
}

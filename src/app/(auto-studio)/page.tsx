import Link from "next/link";
import {
  Bot,
  Workflow,
  MessageCircle,
  Boxes,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";


export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header / hero */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            Automation Studio
          </h1>
          <p className="mt-2 max-w-xl text-sm muted">
            Internal AI tools, automations, and inventory in one place.
            Use this dashboard as your control center while you build
            out the rest of the system.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/chatbot"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium btn-accent"
          >
            Open AI Chatbot
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/automations"
            className="inline-flex items-center gap-2 rounded-lg border-subtle px-4 py-2 text-sm font-medium"
          >
            View Automations
          </Link>
        </div>
      </section>

      {/* Quick nav cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <HomeCard
          href="/chatbot"
          icon={<Bot className="h-5 w-5" />}
          title="AI Chatbot"
          description="Test conversations, debug prompts, and inspect stored dialogue."
        />

        <HomeCard
          href="/automations"
          icon={<Workflow className="h-5 w-5" />}
          title="Automations"
          description="Run and inspect pre-defined automations like invoice extraction or CSV imports."
        />

        <HomeCard
          href="/conversations"
          icon={<MessageCircle className="h-5 w-5" />}
          title="Conversations"
          description="Browse stored chat history and jump back into active threads."
        />

        <HomeCard
          href="/files"
          icon={<FileText className="h-5 w-5" />}
          title="Files"
          description="Manage uploaded documents that your automations and chatbot can use."
        />

        <HomeCard
          href="/inventory"
          icon={<Boxes className="h-5 w-5" />}
          title="Inventory"
          description="Create products, verify SKU/barcode generation, and manage attributes."
        />

        <HomeCard
          href="/users"
          icon={<User className="h-5 w-5" />}
          title="Users (placeholder)"
          description="Future space for user management and permissions."
        />
      </section>

      {/* Getting started checklist */}
      <section className="rounded-xl panel p-4">
        <h2 className="text-sm font-semibold">
          Getting started
        </h2>
        <ul className="mt-3 space-y-2 text-sm muted">
          <li className="flex items-start gap-2">
            <span className="mt-[5px] h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              Create a test product in{" "}
              <Link href="/inventory" className="text-sky-400 hover:underline">
                Inventory
              </Link>{" "}
              and confirm SKU / barcode generation looks right.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[5px] h-2 w-2 rounded-full bg-sky-500" />
            <span>
              Seed and run an automation from{" "}
              <Link href="/automations" className="text-sky-400 hover:underline">
                Automations
              </Link>{" "}
              (e.g. text summarization) to check OpenAI wiring.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[5px] h-2 w-2 rounded-full bg-slate-500" />
            <span>
              Use the{" "}
              <Link href="/chatbot" className="text-sky-400 hover:underline">
                AI Chatbot
              </Link>{" "}
              page to store a conversation and confirm DB persistence.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

type HomeCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

function HomeCard({ href, icon, title, description }: HomeCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-xl panel p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg panel-muted">
          {icon}
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-xs muted">{description}</p>
    </Link>
  );
}

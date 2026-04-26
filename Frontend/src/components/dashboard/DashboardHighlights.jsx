import { Icon } from "./DashboardIcons";
import { formatCurrency } from "../../lib/financeData";

function HighlightCard({ icon, eyebrow, title, description, tone = "teal" }) {
  const toneClasses = {
    teal: "bg-[#effaf7] text-[#11866f] border-[#d4efe7]",
    blue: "bg-[#eef5ff] text-[#2b76d2] border-[#dae7fb]",
    amber: "bg-[#fff7ea] text-[#b97916] border-[#f6e2b8]",
    rose: "bg-[#fff1f1] text-[#cf5a63] border-[#f5d6d9]",
  };

  return (
    <article className={`rounded-2xl border p-4 shadow-[0_18px_38px_rgba(35,66,85,0.06)] ${toneClasses[tone]}`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] opacity-80">{eyebrow}</p>
      <h3 className="mt-2 text-base font-black tracking-[-0.02em] text-[#24313b]">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5d6b77]">{description}</p>
    </article>
  );
}

export default function DashboardHighlights({
  monthlyIncome = 0,
  monthlyExpenses = 0,
  monthlySavings = 0,
  budgetSnapshot,
  recentTransactions = [],
}) {
  const items = budgetSnapshot?.items || [];
  const overspentItems = items.filter((item) => item.overspent);
  const warningItems = items.filter((item) => !item.overspent && Number(item.progress || 0) >= 80);
  const topBudget = overspentItems[0] || warningItems[0] || null;
  const latestExpense = recentTransactions.find((transaction) => transaction.type === "expense");
  const savingsRatio = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  const cards = [
    {
      icon: monthlySavings >= 0 ? "savings" : "alert",
      eyebrow: "Monthly Pulse",
      title:
        monthlyIncome > 0
          ? `You kept ${Math.abs(savingsRatio).toFixed(1)}% of income this month`
          : "Start logging income to unlock a sharper monthly pulse",
      description:
        monthlyIncome > 0
          ? `Income is ${formatCurrency(monthlyIncome)} and expenses are ${formatCurrency(monthlyExpenses)}.`
          : "The dashboard becomes more persuasive once both income and expense streams are recorded.",
      tone: monthlySavings >= 0 ? "teal" : "rose",
    },
    topBudget
      ? {
          icon: topBudget.overspent ? "alert" : "wallet",
          eyebrow: topBudget.overspent ? "Budget Risk" : "Budget Watch",
          title: topBudget.overspent
            ? `${topBudget.category_name} is already over budget`
            : `${topBudget.category_name} is close to budget limit`,
          description: topBudget.overspent
            ? `${formatCurrency(topBudget.spent)} spent on a ${formatCurrency(topBudget.amount_limit)} cap.`
            : `${Number(topBudget.progress || 0).toFixed(0)}% of budget used so far.`,
          tone: topBudget.overspent ? "rose" : "amber",
        }
      : {
          icon: "wallet",
          eyebrow: "Budget Status",
          title: items.length ? "Budgets are under control" : "No budgets tracked yet",
          description: items.length
            ? `${items.length} budget categories are active and none are in the danger zone right now.`
            : "Set budgets to unlock proactive warnings before overspending happens.",
          tone: items.length ? "blue" : "amber",
        },
    latestExpense
      ? {
          icon: latestExpense.icon || "expense",
          eyebrow: "Latest Expense",
          title: latestExpense.description,
          description: `${formatCurrency(latestExpense.amount)} in ${latestExpense.category}. Logged on ${latestExpense.date}.`,
          tone: "blue",
        }
      : {
          icon: "history",
          eyebrow: "Activity",
          title: "No recent expenses recorded",
          description: "As transactions come in, this area highlights the latest spending movement for quick review.",
          tone: "blue",
        },
  ];

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-3">
      {cards.map((card) => (
        <HighlightCard key={card.eyebrow} {...card} />
      ))}
    </section>
  );
}

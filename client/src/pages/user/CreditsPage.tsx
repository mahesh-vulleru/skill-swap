import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ICreditTransaction } from '../../types';

export const CreditsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { success: toastSuccess, error: toastError, warning } = useToast();

  const [balance, setBalance] = useState(user?.credits || 0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactions, setTransactions] = useState<ICreditTransaction[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  // Confirmation dialog state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingPerk, setPendingPerk] = useState<{ name: string; cost: number } | null>(null);

  const fetchCredits = async () => {
    try {
      const res = await api.get('/credits/balance');
      if (res.data?.success) {
        setBalance(res.data.balance);
        setTotalEarned(res.data.totalEarned);
        setTotalSpent(res.data.totalSpent);
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const handlePromptRedeem = (perkName: string, cost: number) => {
    if (balance < cost) {
      warning(`You need ${cost} credits to redeem this perk. Complete more mentorship sessions to earn credits!`);
      return;
    }
    setPendingPerk({ name: perkName, cost });
    setConfirmModalOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!pendingPerk) return;
    const { name: perkName, cost } = pendingPerk;

    setRedeeming(perkName);
    try {
      const res = await api.post('/credits/redeem', { perkName, cost });
      if (res.data?.success) {
        toastSuccess(`You have successfully redeemed: ${perkName}`);
        fetchCredits();
        if (user) {
          updateUserProfile({ credits: res.data.credits, badges: res.data.badges });
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Error redeeming reward');
    } finally {
      setRedeeming(null);
      setConfirmModalOpen(false);
      setPendingPerk(null);
    }
  };

  const storePerks = [
    {
      title: 'Verified Mentor Badge',
      cost: 20,
      desc: 'Display a verified shield on your profile and appear higher in match rankings',
      icon: '🛡️',
    },
    {
      title: 'Featured Profile (7 Days)',
      cost: 15,
      desc: 'Spotlight your offered skills at the top of the Explore directory',
      icon: '⭐',
    },
    {
      title: 'Priority Matchmaking',
      cost: 10,
      desc: 'Instant priority routing when proposing new reciprocal skill exchanges',
      icon: '🚀',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Learning Credits & Rewards Economy"
        subtitle="Manage your time-banking balance, transaction history, and unlock platform rewards"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Credits & Rewards' }]} />

        {/* Balance Hero & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-forest-800 to-forest-700 text-white border-forest-600 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-action" /> Current Credit Balance
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold mt-3 font-['Plus_Jakarta_Sans'] text-white">
                {balance} <span className="text-sm font-semibold text-emerald-200">Credits</span>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 mt-4 leading-relaxed">
              1 credit = 6 minutes of expert learning. Teach what you know to earn more credits!
            </p>
          </Card>

          <Card className="p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Lifetime Credits Earned</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 font-['Plus_Jakarta_Sans']">
              +{totalEarned}
            </div>
            <p className="text-xs text-stone-400 mt-2">Earned through sessions and milestone bonuses</p>
          </Card>

          <Card className="p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Credits Invested In Learning</span>
              <div className="p-2 rounded-xl bg-orange-50 text-action">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 font-['Plus_Jakarta_Sans']">
              -{totalSpent}
            </div>
            <p className="text-xs text-stone-400 mt-2">Invested in 1-on-1 peer learning sessions</p>
          </Card>
        </div>

        {/* Rewards Store */}
        <div>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <Gift className="w-5 h-5 text-action" /> Rewards & Recognition Store
            </h3>
            <p className="text-xs text-stone-500">Redeem earned credits for platform recognition, profile boosts and badges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {storePerks.map((perk, idx) => (
              <Card key={idx} className="p-5 sm:p-6 flex flex-col justify-between hover:border-action transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl select-none">{perk.icon}</span>
                    <Badge variant="orange" size="md">
                      <Coins className="w-3.5 h-3.5" /> {perk.cost} Credits
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-stone-900">{perk.title}</h4>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">{perk.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    disabled={balance < perk.cost}
                    isLoading={redeeming === perk.title}
                    onClick={() => handlePromptRedeem(perk.title, perk.cost)}
                  >
                    {balance < perk.cost ? 'Insufficient Credits' : 'Redeem Perk'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction Ledger Table */}
        <Card className="p-4 sm:p-6">
          <div className="pb-4 border-b border-stone-100 mb-4 sm:mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Credit Transaction Ledger</h3>
              <p className="text-xs text-stone-500">Full audit trail of all earned, spent, and bonus credits</p>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
              {transactions.length} Records
            </span>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3">
                        <Badge
                          variant={
                            tx.type === 'earned'
                              ? 'emerald'
                              : tx.type === 'bonus'
                              ? 'purple'
                              : 'orange'
                          }
                          size="sm"
                        >
                          {tx.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 font-semibold text-stone-800">{tx.description}</td>
                      <td className="py-3 text-stone-400 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right font-bold whitespace-nowrap">
                        <span
                          className={
                            tx.type === 'spent' ? 'text-stone-500' : 'text-emerald-600'
                          }
                        >
                          {tx.type === 'spent' ? `-${tx.amount}` : `+${tx.amount}`} Credits
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog for Redemption */}
      <ConfirmationDialog
        isOpen={confirmModalOpen}
        title="Confirm Reward Redemption"
        message={`Are you sure you want to redeem "${pendingPerk?.name}" for ${pendingPerk?.cost} credits?`}
        confirmText="Confirm & Redeem"
        variant="forest"
        onConfirm={handleConfirmRedeem}
        onCancel={() => {
          setConfirmModalOpen(false);
          setPendingPerk(null);
        }}
      />
    </div>
  );
};

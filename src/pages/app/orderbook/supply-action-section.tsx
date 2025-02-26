import { Button } from "@/components/ui/button";
import { ButtonWallet } from "@/components/ui/button-wallet";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useCLOBState } from "./clob-state";
import { cn } from "@/lib/utils";
import { usePlaceOrder } from "@/hooks/use-place-order";
import { AutoRollSupply } from "./autoroll";
import { useBalance } from "@/hooks/use-balance";

export function SupplyAction() {
	const { state, dispatch } = useCLOBState();
	const { isConnected, address } = useAccount();
	const [amount, setAmount] = useState(0);
	const [amountMarket, setAmountMarket] = useState(0);

	// TODO: Berikut adalah cara integerasi smart contract yang masih (mungkin) salah
	// const contractAddr = "0x8d37312f46377C4cEa898c5183dbb8c4aD1c4e18" as const;
	// const { writeContract, isPending, data: hash } = useWriteContract();
	// const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
	//   hash,
	// });

	// const _debtToken = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
	// const _collateralToken = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
	// const _amount = BigInt(1000000000);
	// const _rate = BigInt(60000000000000000);
	// const _maturity = BigInt(9999999999999999999999999999999);
	// const _maturityMonth = "MAY";
	// const _maturityYear = BigInt(2025);
	// const _lendingOrderType = 0;
	// const _isMatchOrder = false; // Tambahkan nilai default untuk _isMatchOrder

	// const handlePlaceOrder = async () => {
	//   try {
	//     await writeContract({
	//       abi: placeOrderAbi,
	//       address: contractAddr,
	//       functionName: "placeOrder",
	//       args: [
	//         _debtToken,
	//         _collateralToken,
	//         _amount,
	//         _rate,
	//         _maturity,
	//         _maturityMonth,
	//         _maturityYear,
	//         _lendingOrderType,
	//         _isMatchOrder,
	//       ],
	//     });
	//   } catch (error) {
	//     console.error("Error placing order:", error);
	//     toast.dismiss();
	//     toast.error("Transaction failed!");
	//   }
	// };

	// useEffect(() => {
	//   if (isLoading) {
	//     toast.loading("Transaction is being processed...");
	//   }

	//   if (isError || isSuccess) {
	//     toast.dismiss();
	//     toast.success("Order placed successfully!");
	//   }
	// }, [isLoading, isSuccess, isError]);

	const { placeOrder, isPlacing } = usePlaceOrder({
		onSuccess: (result) => {
			console.log("Order placed successfully:", result);
		},
		onError: (error) => {
			console.error("Error placing order:", error);
		},
	});

	const handleClick = async () => {
		try {
			await placeOrder({
				debtToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
				collateralToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
				amount: BigInt(1000000000),
				rate: BigInt(60000000000000000),
				maturity: BigInt(9999999999999999999999999999999),
				maturityMonth: "MAY",
				maturityYear: BigInt(2025),
				lendingOrderType: 0,
				isMatchOrder: false,
			});
		} catch (error) {
			console.error("Failed to place order:", error);
		}
	};

	const {
		balance: amountBalance,
		// error: collateralError,
		// loading: collateralLoading,
	} = useBalance(address!, state.token.debtAddress as `0x${string}`);

	return (
		<Tabs
			onValueChange={(value) => {
				if (value === "market")
					dispatch({ type: "SET_FIXED_RATE", payload: state.bestRate });
				else
					dispatch({
						type: "SET_FIXED_RATE",
						payload: state.orderbookFixedRate,
					});
			}}
			defaultValue="limit"
			className="w-full"
		>
			<TabsList className="grid w-full grid-cols-2 bg-transparent">
				<TabsTrigger
					className="data-[state=active]:bg-[#22232E] border-gray-500 data-[state=active]:text-white"
					value="limit"
				>
					Limit
				</TabsTrigger>
				<TabsTrigger
					className="data-[state=active]:bg-[#22232E] border-gray-500 data-[state=active]:text-white"
					value="market"
				>
					Market
				</TabsTrigger>
			</TabsList>
			<TabsContent value="limit">
				<Card className="border-0 shadow-none bg-[#22232E] p-3 text-white">
					<CardContent className="space-y-2 p-0 my-3">
						<div className="space-y-2 text-lg">
							<div className="flex justify-between items-center mb-6">
								<Label htmlFor="amount-market" className="max-w-sm text-clip">
									Available On Wallet
								</Label>
								<div className="relative flex items-center">
									<Input
										id="amount-market"
										value={amountBalance?.toString()}
										disabled
										className="w-24 text-right border-0 mr-10 bg-transparent text-white"
									/>
									<span className="absolute right-3 text-gray-500 text-sm">
										{state.token.debt}
									</span>
								</div>
							</div>
							<div className="flex justify-between items-center">
								<Label htmlFor="rate-limit">Fixed Rate</Label>
								<Input
									id="rate-limit"
									value={`${state.fixedRate}%`}
									className="w-24 text-right border-0 bg-transparent text-white"
								/>
							</div>
							<div className="flex items-center justify-between gap-2">
								<Label htmlFor="amount-limit">Amount</Label>
								<div className="relative flex items-center">
									<Input
										id="amount-limit"
										value={amount}
										onChange={(e) => {
											const max = state.maxAmount;
											const value = Number(e.target.value) || 0;
											setAmount(value > max ? max : value);
										}}
										className={cn(
											"w-48 text-right border-0 bg-transparent text-white pr-14",
											amount > state.maxAmount && "border",
										)}
									/>
									<span className="absolute right-3 text-gray-500 text-sm">
										{state.token.debt}
									</span>
								</div>
							</div>
							<Slider
								value={[amount]}
								max={state.maxAmount}
								step={1}
								onValueChange={(value) => setAmount(value[0])}
							/>
							<div className="flex justify-end w-full">
								<button
									className="text-xs bg-gray-900 p-1 rounded-sm"
									type="button"
									onClick={() => setAmount(state.maxAmount)}
								>
									Max {amountBalance?.toString()}
								</button>
							</div>
							<br />
							<div className="flex justify-between items-center mb-6">
								<Label htmlFor="autoroll">Auto-roll Supply</Label>
								<AutoRollSupply />
							</div>
						</div>
					</CardContent>
					<CardFooter className="p-0 pr-3">
						{isConnected ? (
							<Button
								type="button"
								className="w-full text-black"
								onClick={handleClick}
							>
								{isPlacing ? "Loading" : "Place Order"}
							</Button>
						) : (
							<div className="w-full">
								<ButtonWallet className="rounded-md w-full" />
							</div>
						)}
					</CardFooter>
				</Card>
			</TabsContent>
			<TabsContent value="market">
				<Card className="border-0 shadow-none bg-[#22232E] p-3 text-white">
					<CardContent className="space-y-2 p-0 my-3">
						<div className="space-y-2 text-lg">
							<div className="flex justify-between items-center mb-6">
								<Label htmlFor="amount-limit" className="max-w-sm text-clip">
									Available On Wallet
								</Label>
								<div className="relative flex items-center">
									<Input
										id="amount-limit"
										value={amountBalance?.toString()}
										disabled
										className="w-24 text-right border-0 mr-10 bg-transparent text-white"
									/>
									<span className="absolute right-3 text-gray-500 text-sm">
										{state.token.debt}
									</span>
								</div>
							</div>
							<div className="flex justify-between items-center">
								<Input
									id="price-market"
									value="98.8"
									className="w-24 hidden text-right border-0 bg-transparent text-white"
								/>
							</div>
							<div className="flex justify-between items-center">
								<Label htmlFor="rate-market">Fixed Rate</Label>
								<Input
									id="rate-market"
									value={`${state.fixedRate}%`}
									className="w-24 text-right border-0 bg-transparent text-white"
								/>
							</div>
							<div className="flex items-center justify-between gap-2">
								<Label htmlFor="amount-market">Amount</Label>
								<div className="relative flex items-center">
									<Input
										id="amount-market"
										value={amountMarket}
										onChange={(e) => {
											const max = state.maxAmount;
											const value = Number(e.target.value) || 0;
											setAmountMarket(value > max ? max : value);
										}}
										className={cn(
											"w-48 text-right border-0 bg-transparent text-white pr-14",
											amountMarket > state.maxAmount && "border",
										)}
									/>
									<span className="absolute right-3 text-gray-500 text-sm">
										{state.token.debt}
									</span>
								</div>
							</div>
							<Slider
								value={[amountMarket]}
								max={state.maxAmount}
								step={1}
								onValueChange={(value) => setAmountMarket(value[0])}
							/>
							<div className="flex justify-end w-full">
								<button
									className="text-xs bg-gray-900 p-1 rounded-sm"
									type="button"
									onClick={() => setAmount(state.maxAmount)}
								>
									Max {amountBalance?.toString()}
								</button>
							</div>
							<br />
							<div className="flex justify-between items-center mb-6">
								<Label htmlFor="autoroll">Auto-roll Supply</Label>
								<AutoRollSupply />
							</div>
						</div>
					</CardContent>
					<CardFooter className="p-0 pr-3">
						{isConnected ? (
							<Button type="button" className="w-full text-black">
								Place Order
							</Button>
						) : (
							<div className="w-full">
								<ButtonWallet className="rounded-md w-full" />
							</div>
						)}
					</CardFooter>
				</Card>
			</TabsContent>
		</Tabs>
	);
}

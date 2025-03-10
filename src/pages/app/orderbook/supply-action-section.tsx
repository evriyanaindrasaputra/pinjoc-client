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
import { AutoRollSupply } from "./autoroll";
import { usePlaceOrder } from "@/hooks/use-place-order";
import { useBalance } from "@/hooks/use-balance";
import { useApprove } from "@/hooks/use-approve";
import { pinjocRouterAddress } from "@/abis/pinjoc/token-abi";

export function SupplyAction() {
	const { state, dispatch } = useCLOBState();
	const { isConnected, address } = useAccount();
	const [amount, setAmount] = useState(0);

	// TODO: Berikut adalah cara integerasi smart contract yang masih (mungkin) salah
	// const contractAddr = "0x6f79Ec0beD0b721750477778B25f02Ac104b8F77" as const;
	//   const { data: hash } = useWriteContract();
	//   const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
	//     hash,
	//   });

	// const handlePlaceOrder = async () => {
	// 	try {
	// 		await writeContract({
	// 			abi: placeOrderAbi,
	// 			address: contractAddr,
	// 			functionName: "placeOrder",
	// 			args: [
	// 				_debtToken,
	// 				_collateralToken,
	// 				_amount,
	// 				_rate,
	// 				_maturity,
	// 				_maturityMonth,
	// 				_maturityYear,
	// 				_lendingOrderType,
	// 				_isMatchOrder,
	// 			],
	// 		});
	// 	} catch (error) {
	// 		console.error("Error placing order:", error);
	// 		toast.dismiss();
	// 		toast.error("Transaction failed!");
	// 	}
	// };

	// useEffect(() => {
	// 	if (isLoading) {
	// 		toast.loading("Transaction is being processed...");
	// 	}

	// 	if (isError || isSuccess) {
	// 		toast.dismiss();
	// 		toast.success("Order placed successfully!");
	// 	}
	// }, [isLoading, isSuccess, isError]);

	const { placeOrder, isPlacing } = usePlaceOrder({
		onSuccess: (result) => {
			console.log("Order placed successfully:", result);
		},
		onError: (error) => {
			console.error("Error placing order:", error);
		},
	});

	const { isApproving, approve } = useApprove({
		onSuccess: (result: any) => {
			console.log("Order placed successfully:", result);
		},
		onError: (error: any) => {
			console.error("Error placing order:", error);
		},
	});

	const handlePlaceOrder = async () => {
		await approve({
			amount: BigInt(amount) * BigInt(10 ** 6),
			spender: pinjocRouterAddress,
			address: state.token.debtAddress as `0x${string}`,
		});
		await placeOrder({
			debtToken: state.token.debtAddress as `0x${string}`,
			collateralToken: state.token.collateralAddress as `0x${string}`,
			amount: BigInt(amount) * BigInt(10 ** 6),
			collateralAmount: BigInt(0),
			rate: BigInt(Math.floor(state.fixedRate * 10 ** 16)),
			maturity: BigInt(1748449527),
			maturityMonth: state.maturity.month,
			maturityYear: BigInt(state.maturity.year),
			lendingOrderType: 0,
		});
	};

	const {
		balance: amountBalance,
		// error: collateralError,
		// loading: collateralLoading,
	} = useBalance(address!, state.token.debtAddress as `0x${string}`);

	return (
		<Tabs
			onValueChange={(value) => {
				if (value === "market") {
					dispatch({ type: "SET_FIXED_RATE", payload: state.bestRate });
					dispatch({
						type: "SET_IS_MARKET",
						payload: true,
					});
				} else {
					dispatch({
						type: "SET_FIXED_RATE",
						payload: state.orderbookFixedRate,
					});
					dispatch({
						type: "SET_IS_MARKET",
						payload: false,
					});
				}
			}}
			value={state.isMarket ? "market" : "limit"}
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
										value={amount.toLocaleString("id-ID")}
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
								max={Number(amountBalance)}
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
								onClick={handlePlaceOrder}
								disabled={amount === 0}
							>
								{isPlacing || isApproving ? "Loading" : "Place Order"}
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
										value={amount.toLocaleString("id-ID")}
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
								max={Number(amountBalance)}
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
								disabled={amount === 0}
								onClick={handlePlaceOrder}
							>
								{isPlacing || isApproving ? "Loading" : "Place Order"}
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

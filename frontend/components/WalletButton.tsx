"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div className={!mounted ? "opacity-0 pointer-events-none" : ""}>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="px-4 py-2 bg-zk-accent hover:bg-zk-accent-hover text-zk-bg rounded-lg font-semibold text-sm transition-all hover:-translate-y-px"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={openChainModal}
                  className="bg-zk-card border border-white/[0.06] hover:border-white/[0.1] rounded-lg px-3 py-1.5 text-xs transition-all"
                >
                  <span className="text-zk-accent">●</span>
                  <span className="text-zk-muted ml-1">{chain.name}</span>
                </button>
                <button
                  onClick={openAccountModal}
                  className="bg-zk-card border border-white/[0.06] hover:border-white/[0.1] rounded-lg px-4 py-2 transition-all"
                >
                  <span className="text-zk-text font-display text-sm">
                    {account.displayName}
                  </span>
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

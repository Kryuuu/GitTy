"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteAccountAction } from "./actions";

export function DeleteAccountButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      await deleteAccountAction();
      window.location.href = "/register";
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to delete account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsModalOpen(true)}
        className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300 shrink-0"
      >
        Delete Account
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your account, remove all your personal data, and destroy any AI agents you have built."
        size="md"
        className="border-red-500/30"
      >
        <div className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {errorMsg}
            </div>
          )}
          
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">
              <strong>Warning:</strong> All your active subscriptions will be canceled immediately.
            </p>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-300/30">
            <Button 
              variant="ghost" 
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Yes, Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

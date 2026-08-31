import { useTranslation } from "react-i18next";
import { Button } from "@orca-blitz/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@orca-blitz/ui/components/ui/dialog";
import { OpenCodeSettings } from "./providers/opencode";
import { OpenAISettings } from "./providers/openai";
import { DefaultSettings } from "./providers/default";
import type { BuiltInProvider, DialogState } from "../types";

interface ProviderDialogProps {
  provider: BuiltInProvider | undefined;
  state: DialogState;
  onClose: () => void;
  onSave: () => void;
  onApiKeyChange: (key: string) => void;
  onSelectModel: (model: string) => void;
  onTabChange: (tab: string) => void;
  onStartAuth: () => void;
  modelListRef: React.RefObject<HTMLDivElement | null>;
}

export function ProviderDialog({
  provider,
  state,
  onClose,
  onSave,
  onApiKeyChange,
  onSelectModel,
  onTabChange,
  onStartAuth,
  modelListRef,
}: ProviderDialogProps) {
  const { t } = useTranslation("providers");
  if (!provider) return null;

  return (
    <Dialog open={state.open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialog.configure", { name: provider.name })}</DialogTitle>
          <DialogDescription>
            {provider.id === "openai" && state.activeTab === "chatgpt"
              ? t("dialog.connectChatgpt")
              : t("dialog.enterApiKey")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {provider.id === "opencode-zen" || provider.id === "opencode-go" ? (
            <OpenCodeSettings
              provider={provider}
              activeTab={state.activeTab}
              apiKey={state.dialogApiKey}
              models={state.fetchedModels}
              selectedModel={state.selectedModel}
              isFetching={state.isFetching}
              error={state.fetchError}
              onTabChange={onTabChange}
              onApiKeyChange={onApiKeyChange}
              onSelectModel={onSelectModel}
              modelListRef={modelListRef}
            />
          ) : provider.id === "openai" ? (
            <OpenAISettings
              provider={provider}
              activeTab={state.activeTab}
              apiKey={state.dialogApiKey}
              models={state.fetchedModels}
              selectedModel={state.selectedModel}
              isFetching={state.isFetching}
              error={state.fetchError}
              authStatus={state.authStatus}
              isAuthenticating={state.isAuthenticating}
              onTabChange={onTabChange}
              onApiKeyChange={onApiKeyChange}
              onSelectModel={onSelectModel}
              onStartAuth={onStartAuth}
              modelListRef={modelListRef}
            />
          ) : (
            <DefaultSettings
              provider={provider}
              apiKey={state.dialogApiKey}
              models={state.fetchedModels}
              selectedModel={state.selectedModel}
              isFetching={state.isFetching}
              error={state.fetchError}
              onApiKeyChange={onApiKeyChange}
              onSelectModel={onSelectModel}
              modelListRef={modelListRef}
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("common:actions.cancel")}
          </DialogClose>
          <Button onClick={onSave}>{t("common:actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

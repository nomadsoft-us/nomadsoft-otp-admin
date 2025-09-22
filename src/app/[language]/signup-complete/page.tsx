import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import SignupCompleteContent from "./page-content";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "common");

  return {
    title: t("Congratulations!"),
  };
}

export default async function SignupCompletePage() {
  return <SignupCompleteContent />;
}

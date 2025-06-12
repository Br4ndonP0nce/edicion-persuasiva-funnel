import React from "react";
import TypeformQuiz from "@/components/ui/Form/Form";

import { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";

export const metadata: Metadata = routeMetadata.join;
const page = () => {
  return (
    <main>
      <TypeformQuiz />
    </main>
  );
};

export default page;

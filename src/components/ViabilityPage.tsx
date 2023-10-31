import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { CommunitiesCard } from "./CommunitiesCard";
import { MorphologyCard } from "./MorphologyCard";

export const ViabilityPage = () => {
  return (
    <>
      <SizeCard />
      <CommunitiesCard />
      <MorphologyCard />
      <SketchAttributesCard autoHide />
    </>
  );
};

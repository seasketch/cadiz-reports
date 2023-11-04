import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { CommunitiesCard } from "./CommunitiesCard";
import { MorphologyCard } from "./MorphologyCard";
import { SeagrassCard } from "./SeagrassCard";

export const ViabilityPage = () => {
  return (
    <>
      <SizeCard />
      <SeagrassCard />
      <CommunitiesCard />
      <MorphologyCard />
      <SketchAttributesCard autoHide />
    </>
  );
};

import React, { useEffect, useState } from "react";
import { Heading, LoadingSpinner, Text, hubspot } from "@hubspot/ui-extensions";
import { useHSInit } from "./hsInitHook";

hubspot.extend(({ actions, runServerlessFunction }) => (
  <NaughtyOrNice
    runServerless={runServerlessFunction}
    fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
  />
));

const naughtyOrNiceProperty = {
  name: "naughty_or_nice",
  label: "Naughty or Nice",
  groupName: "contactinformation",
  type: "number",
};

const NaughtyOrNice = ({ fetchCrmObjectProperties, runServerless }) => {
  const [contactName, setContactName] = useState(null);
  const [isNice, setIsNice] = useState(null);

  const initStatus = useHSInit(runServerless, {
    properties: [{ objectType: "contacts", options: naughtyOrNiceProperty }],
  });

  useEffect(() => {
    if (initStatus.success) {
      fetchCrmObjectProperties(["firstname", "naughty_or_nice"]).then(
        ({ firstname, naughty_or_nice }) => {
          setContactName(firstname);
          setIsNice(naughty_or_nice || false);
        }
      );
    }
  }, [fetchCrmObjectProperties, initStatus.success]);

  if (initStatus.error) {
    return <Text>Error initializing: {initStatus.error}</Text>;
  }
  if (initStatus.success) {
    return (
      <Heading>
        Santa says {contactName} is {isNice ? "nice" : "naughty"}
      </Heading>
    );
  }
  return <LoadingSpinner label="Loading..." />;
};

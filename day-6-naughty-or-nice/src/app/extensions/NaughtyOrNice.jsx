import React, { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Flex,
  LoadingSpinner,
  Text,
  hubspot,
} from "@hubspot/ui-extensions";
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
  const [contactId, setContactId] = useState(null);
  const [isNice, setIsNice] = useState(null);
  const [propsLoading, setPropsLoading] = useState(true);

  const initStatus = useHSInit(runServerless, {
    properties: [{ objectType: "contacts", options: naughtyOrNiceProperty }],
  });

  useEffect(() => {
    if (initStatus.success) {
      fetchCrmObjectProperties([
        "firstname",
        "naughty_or_nice",
        "hs_object_id",
      ]).then(({ firstname, naughty_or_nice, hs_object_id }) => {
        setContactName(firstname);
        setContactId(hs_object_id);
        setIsNice(naughty_or_nice ? parseInt(naughty_or_nice) : null);
        setPropsLoading(false);
      });
    }
  }, [fetchCrmObjectProperties, initStatus.success]);

  const toggleNaughtyOrNice = (newValue) => {
    runServerless({
      name: "setNaughtyOrNice",
      parameters: { contactId, newValue },
    }).then((resp) => {
      if (resp.response) {
        setIsNice(newValue);
      }
    });
  };

  if (initStatus.error) {
    return <Text>Error initializing: {initStatus.error}</Text>;
  }
  if (!propsLoading && initStatus.success) {
    const message =
      typeof isNice === "number"
        ? `Santa says ${contactName} is ${isNice ? "nice" : "naughty"}`
        : `Santa has not decided if ${contactName} is naughty or nice yet`;
    return (
      <Flex direction="column" justify="center" align="center" gap="md">
        <Heading>{message}</Heading>
        <Flex justify="center" gap="sm">
          <Button
            onClick={() => toggleNaughtyOrNice(0)}
            disabled={isNice === 0}
            variant="destructive"
            type="button"
          >
            Add to naughty list
          </Button>
          <Button
            onClick={() => toggleNaughtyOrNice(1)}
            disabled={isNice === 1}
            variant="primary"
            type="button"
          >
            Add to nice list
          </Button>
        </Flex>
      </Flex>
    );
  }
  return <LoadingSpinner label="Loading..." />;
};

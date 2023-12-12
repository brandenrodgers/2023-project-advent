import React, { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Link,
  Flex,
  LoadingSpinner,
  Text,
  hubspot,
} from "@hubspot/ui-extensions";

hubspot.extend(({ runServerlessFunction }) => (
  <ChristmasJoke runServerless={runServerlessFunction} />
));

const ChristmasJoke = ({ runServerless }) => {
  const [loadingJoke, setLoadingJoke] = useState(true);
  const [joke, setJoke] = useState(null);
  const [showAnswer, setShowAnser] = useState(false);

  useEffect(() => {
    fetchNewJoke();
  }, []);

  const fetchNewJoke = () => {
    if (showAnswer) {
      setShowAnser(false);
    }
    if (!loadingJoke) {
      setLoadingJoke(true);
    }
    runServerless({ name: "getJoke" }).then((resp) => {
      if (resp.response) {
        setJoke(resp.response);
      }
      setLoadingJoke(false);
    });
  };

  const renderJoke = () => {
    if (loadingJoke) {
      return <LoadingSpinner label="Loading joke..." />;
    }
    if (!joke) {
      return <Text>failed to load joke. Try again</Text>;
    }
    return (
      <Flex direction="column" justify="center" align="center" gap="md">
        <Heading>{joke.setup}</Heading>
        {showAnswer ? (
          <Heading>{joke.delivery}</Heading>
        ) : (
          <Link onClick={() => setShowAnser(true)}>Answer</Link>
        )}
      </Flex>
    );
  };

  return (
    <Flex direction="column" justify="center" align="center" gap="md">
      {renderJoke()}
      <Button
        onClick={fetchNewJoke}
        disabled={loadingJoke}
        variant="primary"
        type="button"
      >
        New joke
      </Button>
    </Flex>
  );
};

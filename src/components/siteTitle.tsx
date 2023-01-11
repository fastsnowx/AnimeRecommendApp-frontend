import React from "react";
import styles from "./siteTitle.module.css";
import { Title } from "@mantine/core";
import { AiOutlineSearch, AiFillGithub } from "react-icons/ai";
import { Input, Group } from "@mantine/core";
import { ActionIcon, Image } from "@mantine/core";

//サイトタイトルのコンポーネント
//@param onChange - 検索ボックスの中身が変更されたときに実行する関数
//@return サイトのタイトルが表示される

type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const SiteTitle: React.FC = () => {
  return (
    <Group position="apart">
      <Group className={styles.logo}>
        <Image
          src={`${process.env.PUBLIC_URL}/logo.png`}
          height={50}
          width={50}
        />
        <Title order={1}>RecoAni</Title>
      </Group>

      <div className={styles.right}>
        <Group position="right">
          <ActionIcon
            variant="default"
            size="lg"
            component="a"
            href="https://github.com/re-nan6/RecoAni"
            target="_blank"
          >
            <AiFillGithub size={25} />
          </ActionIcon>
        </Group>
      </div>
    </Group>
  );
};

export default SiteTitle;

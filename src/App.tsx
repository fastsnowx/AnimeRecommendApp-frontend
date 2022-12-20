import React, { useState, useEffect } from 'react';
import './App.css';
import MalCard from './components/malCard';
import ResultAnime from './components/resultAnime';
import SearchBox from './components/searchBox';
import SearchButton from './components/searchButton';
import Sidebar from './components/sidebar';
import SiteTitle from './components/siteTitle';
import Anime from './anime.json';
import { MdDeleteForever } from 'react-icons/md';
import _ from 'lodash';
import { gql, useLazyQuery, DocumentNode } from '@apollo/client';
import { AppShell, Header, Navbar, Pagination } from '@mantine/core';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  }
})

function App() {

  //annictAPIから受け取れるjsonファイルの中身の型定義
  interface animeInterface {
    __typename: string
    annictId: number
    malAnimeId: string
    officialSiteUrl: string
    title: string
    twitterUsername: string
    wikipediaUrl:string
  }

  //検索前に表示するアニメのリストを作成
  const initial_anime = [];
  for (let i = 0; i < Anime.searchWorks.nodes.length; i++) {
    initial_anime.push(Anime.searchWorks.nodes[i]);
  }

  //レコメンド結果表示に必要なフラグの定義
  const [pushCount, setPushCount] = useState<number>(0);
  //表示するアニメカードのページ数を管理している
  const [numPage, setNumPage] = useState<number>(0);
  //現在表示しているページ番号を管理している
  const [nowPage, setNowPage] = useState<number>(1);
  //表示させるアニメを管理している
  const [displayAnimeList, setDisplayAnimeList] = useState<Array<animeInterface>>([]);
  //アニメカードの表示に必要な変数の定義
  //とりあえず初期値はテキトーなので直す余地あり
  const [animeList, setAnimeList] = useState<Array<animeInterface>>([]);
  const [val, setVal] = useState<Array<string>>([]);
  const [likeId, setLikeId] = useState<Array<string>>([]);
  const [SEARCH_ANIME, setSEARCH_ANIME] = useState<DocumentNode>(gql`
  query {
    searchWorks(
      orderBy: { field: WATCHERS_COUNT, direction: DESC },
      first: 10,
      titles: []
    ) {
        nodes {
          annictId
          malAnimeId
          officialSiteUrl
          title
          twitterUsername
          wikipediaUrl
      }
    }
  }
  `);

  //graphQLでannictAPIを適宜呼び出すためのもの
  const [inputAnime, { data }] = useLazyQuery(SEARCH_ANIME);

  //テキストボックスに入力された文字列を元にqueryを作成
  const search = (value: string) => {
    setSEARCH_ANIME(gql`
    query {
      searchWorks(
        orderBy: { field: WATCHERS_COUNT, direction: DESC },
        first: 20,
        titles: ["${value}"]
      ) {
          nodes {
            annictId
            malAnimeId
            officialSiteUrl
            title
            twitterUsername
            wikipediaUrl
        }
      }
    }
    `)
  }

  //テキストボックスの中身が変わるたびにこの関数が実行される
  //queryの定義とannictAPIの使用
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);
    inputAnime();
  }

  //選択しているアニメカードを管理している(アニメカードをクリックした際に実行)
  const valChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (val.includes(e.target.value)) {
      setVal(val.filter(item => item !== e.target.value));
    } else {
      setVal([...val, e.target.value]);
    }
    if (likeId.includes(e.target.id)) {
      setLikeId(likeId.filter(item => item !== e.target.id));
    } else {
      setLikeId([...likeId, e.target.id]);
    }
  }

  //選択しているアニメカードを管理している(選択されたアニメ一覧にあるボタンを押した際に実行)
  const valChangeBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (val.includes(e.currentTarget.value)) {
      setVal(val.filter(item => item !== e.currentTarget.value));
    } else {
      setVal([...val, e.currentTarget.value]);
    }
    if (likeId.includes(e.currentTarget.id)) {
      setLikeId(likeId.filter(item => item !== e.currentTarget.id));
    } else {
      setLikeId([...likeId, e.currentTarget.id]);
    }
  }

  //選択されたアニメ一覧を表示する
  //確認用なので後で消す
  const valDisplay = () => [
    setPushCount(pushCount + 1)
  ]

  //検索した結果出てきたアニメの情報をリストに格納してる
  const makeAnimeList = () => {
    if (data) {
      console.log(data)
      const li = [];
      for (let i = 0; i < data.searchWorks.nodes.length; i++) {
        li.push(data.searchWorks.nodes[i]);
      }
      setAnimeList(li);
      const lenAnimeList = li.length;
      setNumPage((lenAnimeList > 10) ? Math.ceil(lenAnimeList / 10) : 0)
      setDisplayAnimeList(li.slice(0, 10))
      console.log(animeList)
    }else{
      inputAnime();
    }
  }

  //ページ遷移をした際の処理
  const changePage = (page: number) => {
    const end = (page) * 10;
    const start = end - 10;
    setNowPage(page);
    setDisplayAnimeList(animeList.slice(start, end));
  }

  //data(graphQLの実行結果)の値が変わる度にmakeAnimeList関数が実行される
  useEffect(makeAnimeList, [data])

  return (
    <QueryClientProvider client={queryClient}>
      <div className='App'>
        <AppShell
          navbar={<Navbar width={{ base: 200 }}>
            <SearchBox onChange={_.debounce((e) => handleChange(e), 500)} />
            <Sidebar setSearchAnime={setSEARCH_ANIME} setNowPage={setNowPage} inputAnime={inputAnime} />
          </Navbar>}
          header={<Header height={60}><SiteTitle /></Header>}>
          <div className="main">
            <div className='animebox'>
              <div className='animes'>
                {displayAnimeList.map((info, index) => {
                  return (
                    <MalCard annictID={info.annictId} malAnimeId={info.malAnimeId} officialSiteUrl={info.officialSiteUrl} animeTitle={info.title} twitterUsername={info.twitterUsername} wikipediaUrl={info.wikipediaUrl} value={info.title} onChange={valChange} checked={val.includes(info.title)} key={info.malAnimeId} />
                  )
                })}
              </div>
              <Pagination total={numPage} position="center" onChange={(page: number) => changePage(page)} page={nowPage} />
            </div>
            <div>
              現在選択中のアニメ
            </div>
            <div className='selectAnimeBox'>
              <ul>
                {val.map((title, index) =>
                  <li value={title} id={likeId[index]}>
                    {title}
                    <button className="deleteBtn" onClick={valChangeBtn} value={title} id={likeId[index]}>
                      <MdDeleteForever className='deleteIcon' />
                    </button>
                  </li>
                )}
              </ul>
            </div>
            <SearchButton onClick={valDisplay} />
            <ResultAnime pushCount={pushCount} likeList={likeId} />
          </div>
        </AppShell>
      </div>
    </QueryClientProvider>
  );
}

export default App;

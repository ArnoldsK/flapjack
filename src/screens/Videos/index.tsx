import absoluteUrl from "next-absolute-url"
import { GetServerSideProps } from "next"

import * as S from "./styles"
import { ApiVideos } from "~/types/api"
import { Page } from "~/src/components/Page"

interface VideoSCreenProps {
  videos: ApiVideos
}

export const VideosScreen = ({ videos }: VideoSCreenProps) => {
  // #############################################################################
  // Render
  // #############################################################################
  return (
    <Page title="Videos">
      <S.Wrap>
        <S.PageTitle>
          The 100 latest videos <S.NoWrap>Pepsi Dog</S.NoWrap> is watching
        </S.PageTitle>
        <S.VideosWrap>
          {videos.map((video) => (
            <S.Video
              key={video.messageId}
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <S.Thumbnail $src={video.thumbnailUrl} />
              <S.Details>
                <S.Title>{video.deArrowTitle ?? video.title}</S.Title>
                <S.Author>{video.authorName}</S.Author>
              </S.Details>
            </S.Video>
          ))}
        </S.VideosWrap>
      </S.Wrap>
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<VideoSCreenProps> = async (
  ctx,
) => {
  const { origin } = absoluteUrl(ctx.req)
  const res = await fetch(`${origin}/api/videos`)
  const videos = await res.json()

  return {
    props: {
      videos,
    },
  }
}

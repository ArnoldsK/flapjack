import { GetServerSideProps } from "next"
import absoluteUrl from "next-absolute-url"

import * as S from "./styles"

import { Page } from "~/src/components/Page"
import { ApiVideos } from "~/types/api"

interface VideoScreenProps {
  videos: ApiVideos
}

export const VideosScreen = ({ videos }: VideoScreenProps) => {
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
              <S.ThumbnailWrap>
                <S.User>{video.userDisplayName}</S.User>
                <S.Thumbnail $src={video.thumbnailUrl} />
              </S.ThumbnailWrap>
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

export const getServerSideProps: GetServerSideProps<VideoScreenProps> = async (
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

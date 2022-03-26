<template>
    <div>
        <div v-if="false" style="position:fixed; background-color:black; z-index:1; width:100%; height:100%; opacity:0.5; margin:0; padding:0;"></div>
        <div style="position:fixed; left:80%; top:80%; z-index:0;">
            <span>{{checkedCount}} / {{targetList.length}}</span>
            <br>
            <button @click="excelDown" size="sm" class="btn btn-primary ml-5 mob-mb-20 mob-mr-10">엑셀다운</button>
            <button v-if="false" @click="saveOnTemp" size="sm" class="btn btn-primary ml-5 mob-mr-10">임시저장</button>
        </div>
        <doda-header></doda-header>
        <br>
        <table>
          <tr>
            <th>KEY</th>
            <td><input v-model="accessToken" type="text" style="width:110px;"></td>
          </tr>
          <tr v-show="teamName=='테스트'">
            <th>URL</th>
            <td><input v-model="testUrl" type="text" style="width:110px;"></td>
          </tr>
          <tr>
            <th>팀 선택</th>
            <td align="left">
              <select v-model="teamName" style="height:35px; width:80px; fontSize:15px; margin-left:10px;">
                <!-- <option value=''>선택</option> -->
                <option value="최강팀">최강팀</option>
                <!-- <option value="ok팀">ok팀</option> -->
                <!-- <option value="위너팀">위너팀</option>  -->
                <option value="테스트">테스트</option>
              </select>
            </td>
          </tr>
          <tr>
           <th>조회일 선택</th>
            <td align="left">
              <select v-model="selDate" style="height:35px; width:120px; margin-left:10px;">
                <option v-for="option in selDateList" :value=option :key=option>{{option}}</option>
              </select>
            </td>
          </tr>
          <tr>
           <th>정렬기준</th>
            <td align="left">
              <select v-model="viewSort" style="height:35px; width:120px; margin-left:10px;">
                <option value="01">이름</option>
                <option value="02">시간</option>
              </select>
            </td>
            <td>
              <button @click="getBandkey" class="btn btn-primary mr-5">조회</button>
            </td>
          </tr>
        </table>
        <br>
          <input v-show="false" type="file" ref="fileUp" @change="readAsExcel">
          <button v-if="false" @click="$refs.fileUp.click()" class="btn btn-primary mr-5 mt20">임시저장 파일업로드</button>
        <br>
        <br>
        <doda-notice :commentsLength=targetList.length :memberListLength=memberList.length></doda-notice>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <div v-for="(item,index) in targetList" :key="index" style="text-align:center;">
          <div style="width:300px; display:inline-block; position:relative">
            <div style="position:absolute; left:0px; top:-60px;">
              <input type="checkbox" :checked="targetList[index].mainCategory !== '' && targetList[index].point !== ''">
              <select v-model="targetList[index].mainCategory" style="position:relative; top:-12px; left:5px; height:30px;" @change="changeMainCategory(index, $event.target.value, 'point'+index)">
                <option v-for="option in selMainCategoryList" :value="option.value" :key=option>{{option.text}}</option>
              </select>
              <select v-model="targetList[index].point" style="position:relative; top:-12px; left:15px; height:30px;" :ref="'point'+index" class="scroll-margin">
                <option value="">선택</option>
                <option v-if="targetList[index].mainCategory === '15'" value="0">0점</option>
                <option v-if="targetList[index].mainCategory === '02'" value="5">5점</option>
                <option value="10">10점</option>
                <option v-if="targetList[index].mainCategory === '02'" value="15">15점</option>
                <option v-if="targetList[index].mainCategory !== '05'" value="20">20점</option>
                <option v-if="targetList[index].mainCategory === '02'" value="25">25점</option>
                <option value="30">30점</option>
                <option v-if="targetList[index].mainCategory === '02'" value="40">40점</option>
              </select>
              <button @click="moveScrollToNext('point'+(index+1))" class="btn btn-primary mr-5" style="position:relative; top:-14px; left:25px; height:30px;">다음</button>
            </div>
            <img :src="item.profileUrl" style="border-radius:50%; width:34px; height:34px; position:absolute; left:0px;">
            <div>
            <span style="position:absolute; left:40px; font-weight:bold;">{{item.name}}</span>
            <br>
            <div style="position:relative; text-align:left; left:40px;">{{item.content}}</div>
            <br>
            <span style="position:absolute; left:40px;" :class="{'red' : this.isTimeOver(item.writeTime)}">{{item.writeTime}}</span>
            <br>
            <img :src="item.contentPhotoUrl" style="width:230px; height:320px;" onerror="https://i.ibb.co/jzBqmNp/1.png">
            </div>
            <hr>
            <br>
            <br>
            <br>
          </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import Xlsx from 'xlsx'
import DodaHeader from '../components/DodaHeader.vue'
import DodaNotice from '../components/DodaNotice.vue'

export default {
  components: { DodaHeader, DodaNotice },
  data: function () {
    return {
      testUrl: '',
      writer: '염은주',
      bandListUrl: 'https://openapi.band.us/v2.1/bands?access_token=',
      boardListUrl: 'https://openapi.band.us/v2/band/posts?access_token=',
      commnetListUrl: 'https://openapi.band.us/v2/band/post/comments?access_token=',
      accessToken: '',
      bandKey: '',
      teamName: '최강팀',
      postKey: '',
      commentCount: 0,
      nextParams: '',
      commentList: [],
      targetList: [],
      selDate: '',
      selDateList: [],
      selMainCategoryList: [
        { text: '선택', value: '' },
        { text: '식사류', value: '01' },
        { text: '부스터류', value: '02' },
        { text: '클렌징', value: '03' },
        { text: '타블렛', value: '04' },
        { text: '가족과함께', value: '05' },
        { text: '아우터', value: '06' },
        { text: '마스크팩', value: '07' },
        { text: '민트팩', value: '08' },
        { text: '점수없음', value: '15' }
      ],
      memberList: [],
      viewSort: '01'
    }
  },
  created: function () {
    this.accessToken = this.getCookie('key')
    this.init()
  },
  mounted: function () {
  },
  computed: {
    checkedCount: function () {
      var count = 0
      for (var z = 0; z < this.targetList.length; z++) {
        if (this.targetList[z].mainCategory !== '' && this.targetList[z].point !== '') {
          ++count
        }
      }
      return count
    }
  },
  methods: {
    getBandkey: function () {
      if (this.teamName === '테스트') {
        console.log(this.teamName)
        axios.get(this.testUrl).then(res => {
          this.count(res.data)
        })
        return
      }
      axios.get(this.bandListUrl + this.accessToken).then(res => {
        console.log(res)
        if (res.data.result_code !== 1) {
          alert('오류코드 : ' + res.data.result_code + '발생, 캡쳐하여 단톡방에 공유바랍니다.')
          return
        }
        // 성공한 경우
        this.bandKey = res.data.result_data.bands[0].band_key
        this.setCookie('key', this.accessToken, 365)
        this.getBoardInfo()
      }).catch(function (error) {
        if (error.response.status === 401) {
          alert('KEY 입력이 잘못되었습니다')
        } else {
          alert('알 수 없는 오류로 조회에 실패하였습니다. 재조회 시도 바랍니다.')
        }
      })
    },
    getBoardInfo: function () {
      // 게시글 조회
      axios.get(this.boardListUrl + this.accessToken + '&band_key=' + this.bandKey + '&locale=ko_KR').then(res => {
        var list = res.data.result_data.items
        for (let i = 0; i < list.length; i++) {
          // 작성자 확인
          // var isContainWriter = list[i].author.name.toLowerCase().indexOf(this.writer) !== -1
          // 작성자 아이디에 선택한 팀명 포함여부 확인
          var isSelTeamName = list[i].author.name.toLowerCase().indexOf(this.teamName) !== -1
          // 작성 글 본문에 오픈이라는 단어가 포함되어있는지 확인
          var isSelKeyWord = list[i].content.indexOf('오픈창') !== -1
          // 작성 일자와 조회일자가 일치하는지 확인
          var isSelTime = this.unixTimestamp(list[i].created_at).indexOf(this.selDate) !== -1
          if (isSelTeamName && isSelKeyWord && isSelTime /* && isContainWriter */) {
            this.commentCount = list[i].comment_count
            this.postKey = list[i].post_key
            // 댓글목록 조회 호출
            this.getCommentInfo()
            return
          }
        }
        // for루프를 돌았는데도 없으면
        alert('해당 일자의 게시물이 작성되지 않았거나 작성 내용이 가이드에 맞지 않게 작성되었습니다.')
      })
    },
    getCommentInfo: function () {
      // 댓글 호출
      let url = ''
      if (this.nextParams === '') {
        url = this.commnetListUrl + this.accessToken + '&band_key=' + this.bandKey + '&post_key=' + this.postKey + '&sort=created_at'
      } else {
        url = this.commnetListUrl + this.nextParams.access_token + '&band_key=' + this.nextParams.band_key + '&post_key=' + this.nextParams.post_key + '&sort=created_at' + '&after=' + this.nextParams.after + '&limit=' + this.nextParams.limit
      }
      axios.get(url).then(res => {
        this.commentList.push(res.data.result_data)
        // next_params가 null일때 까지 재귀호출 하면서 result_data를 commentList에 추가
        if (this.isEmpty(res.data.result_data.paging.next_params)) {
          this.count(this.commentList)
        } else {
          this.nextParams = res.data.result_data.paging.next_params
          this.getCommentInfo()
        }
      })
    },
    // 댓글 FORMAT 형식 변경
    // 점수 계산 등 전부 이 쪽에서 처리함
    count: function (list) {
      console.log('▼▼▼▼▼▼▼▼▼가공전 댓글 목록▼▼▼▼▼▼▼▼▼')
      console.log(list)
      console.log('▲▲▲▲▲▲▲▲▲가공전 댓글 목록▲▲▲▲▲▲▲▲▲')
      // 초기화
      this.targetList = []
      // 댓글 목록에서 이름과 프로필주소, 내용이미지, 내용 등 필요 내용만 뽑아서 targetList에 추가
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list[i].items.length; j++) {
          var obj = {}
          obj.writeTime = this.unixTimestamp(list[i].items[j].created_at)
          obj.name = list[i].items[j].author.name
          obj.profileUrl = list[i].items[j].author.profile_image_url
          obj.contentPhotoUrl = list[i].items[j].photo === null ? 'https://i.ibb.co/pX2Yxkf/1.png' : list[i].items[j].photo.url
          obj.content = list[i].items[j].content
          var contentObj = this.contentInfo(obj.content)
          obj.mainCategory = contentObj.mainCategory
          obj.point = contentObj.point
          this.targetList.push(obj)
        }
      }
      // 정렬
      this.sortList(this.viewSort, this.targetList)
    },
    setCookie: function (cookieName, value, days) {
      console.log('setCookie')
      var exdate = new Date()
      exdate.setDate(exdate.getDate() + days)
      // 설정 일수만큼 현재시간에 만료값으로 지정
      var cookieValue = escape(value) + ((days == null) ? '' : '; expires=' + exdate.toUTCString())
      document.cookie = cookieName + '=' + cookieValue
    },
    getCookie: function (name) {
      var cookieList = document.cookie.split(';')
      for (var i = 0; i < cookieList.length; i++) {
        cookieList[i] = cookieList[i].trim()
        var eqIndex = cookieList[i].indexOf('=')
        if (cookieList[i].substr(0, eqIndex) === name) {
          return cookieList[i].substr(eqIndex + 1)
        }
      }
    },
    deleteCookie: function (value) {
      document.cookie = value + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;'
    },
    isEmpty: function (value) {
      if (value === undefined || value === null) {
        return true
      }
      return false
    },
    unixTimestamp: function (t) {
      var date = new Date(t)
      var year = date.getFullYear()
      var month = '0' + (date.getMonth() + 1)
      var day = '0' + date.getDate()
      var hour = '0' + date.getHours()
      var minute = '0' + date.getMinutes()
      var second = '0' + date.getSeconds()
      return year + '-' + month.substr(-2) + '-' + day.substr(-2) + ' ' + hour.substr(-2) + ':' + minute.substr(-2) + ':' + second.substr(-2)
    },
    isTimeOver: function (value) {
      if (parseInt(value.substr(11, 2)) >= 22 && parseInt(value.substr(14, 2)) >= 1) {
        return true
      }
      return false
    },
    init: function () {
      this.targetList = [] // 초기화
      this.postKey = ''
      this.commentCount = 0
      this.nextParams = ''
      this.commentList = []
      this.memberList = this.getMember()
      this.selDateList = this.settingDate(3)
    },
    settingDate: function (day) {
      var list = []
      for (var i = 0; i < day; i++) {
        var date = new Date().setDate(new Date().getDate() - i)
        var formatDate = this.unixTimestamp(date).substring(0, 10)
        list.push(formatDate)
        if (i === 0) this.selDate = formatDate
      }
      return list
    },
    excelDown: function () {
      console.log('▼▼▼▼▼▼▼▼▼저장되어있는 명단▼▼▼▼▼▼▼▼▼')
      console.log(this.memberList)
      console.log('▲▲▲▲▲▲▲▲▲저장되어있는 명단▲▲▲▲▲▲▲▲▲')
      console.log('▼▼▼▼▼▼▼▼▼댓글 명단▼▼▼▼▼▼▼▼▼')
      console.log(this.targetList)
      console.log('▲▲▲▲▲▲▲▲▲댓글 명단▲▲▲▲▲▲▲▲▲')
      console.log('메인데이터')
      // 점수 초기화
      this.memberList.forEach(function (item) {
        item.식사류 = 0
        item.부스터류 = 0
        item.클렌징 = 0
        item.타블렛 = 0
        item.가족과함께 = 0
        item.마스크팩 = 0
        item.민트팩 = 0
        item.아우터 = 0
      })
      for (var k = 0; k < this.targetList.length; k++) {
        var isFind = false
        for (var a = 0; a < this.memberList.length; a++) {
          var targetName = this.targetList[k].name.substring(0, this.targetList[k].name.indexOf('(')).trim()
          var targetClubName = this.targetList[k].name.substring(this.targetList[k].name.indexOf('(') + 1, this.targetList[k].name.indexOf('/')).trim().toLowerCase()
          var memberName = this.memberList[a].이름
          var memberClubName = this.memberList[a].클럽명.toLowerCase()
          if (targetName === memberName && targetClubName === memberClubName) {
            if (this.targetList[k].point === '' && this.teamName !== '테스트') {
              // alert('점수가 선택되지 않은 항목이 존재합니다')
              // this.moveScrollToNext('point' + k)
              // return
            }
            isFind = true
            if (this.targetList[k].mainCategory === '01') {
              this.memberList[a].식사류 += parseInt(this.targetList[k].point)
              continue
            } else if (this.targetList[k].mainCategory === '02') {
              this.memberList[a].부스터류 += parseInt(this.targetList[k].point)
              continue
            } else if (this.targetList[k].mainCategory === '03') {
              this.memberList[a].클렌징 += parseInt(this.targetList[k].point)
              continue
            } else if (this.targetList[k].mainCategory === '04') {
              this.memberList[a].타블렛 += parseInt(this.targetList[k].point)
              continue
            } else if (this.targetList[k].mainCategory === '05') {
              this.memberList[a].가족과함께 += parseInt(this.targetList[k].point)
              continue
            } else if (this.targetList[k].mainCategory === '06') {
              this.memberList[a].아우터 += parseInt(this.targetList[k].point)
              continue
            } else if (this.targetList[k].mainCategory === '07') {
              this.memberList[a].마스크팩 += parseInt(this.targetList[k].point)
              continue
            } else if (this.targetList[k].mainCategory === '08') {
              this.memberList[a].민트팩 += parseInt(this.targetList[k].point)
              continue
            }
          }
        }
        // "writeTime": "2021-12-15 19:57:12",
        // "name": "김여은(점핑크루/최강팀)",
        // "profileUrl": "https://coresos-phinf.pstatic.net/a/33gjc7/i_cedUd018svcuz4juiqrqp3c_deoxpi.jpg",
        // "contentPhotoUrl": "https://coresos-phinf.pstatic.net/a/340i5a/8_j46Ud018svc187bcvdwa8x2l_deoxpi.jpg",
        // "content": "쉐이크",
        // "mainCategory": "01",
        // "point": "10"
        if (!isFind) {
          console.log('▼▼▼▼▼▼▼▼▼명단에 없는 사람이 존재합니다.▼▼▼▼▼▼▼▼▼')
          console.log(this.targetList[k])
          console.log('▲▲▲▲▲▲▲▲▲명단에 없는 사람이 존재합니다.▲▲▲▲▲▲▲▲▲')
          var name = this.targetList[k].name
          var obj = {
            이름: name.substring(0, name.indexOf('(')).trim(),
            클럽명: name.substring(name.indexOf('(') + 1, name.indexOf('/')).trim(),
            식사류: 0,
            부스터류: 0,
            클렌징: 0,
            타블렛: 0,
            가족과함께: 0,
            마스크팩: 0,
            민트팩: 0,
            아우터: 0,
            신규여부: 'O'
          }
          this.memberList.push(obj)
          k = k - 1
        }
      }
      for (var m = 0; m < this.memberList.length; m++) {
        // 허브티가 식사류가 아니면 아래 -5 단위 지우는 로직제거
        if (this.memberList[m].식사류 % 10 !== 0 && this.memberList[m].식사류 % 5 === 0) {
          this.memberList[m].식사류 -= 5
        }
        if (this.memberList[m].식사류 >= 100) {
          this.memberList[m].식사류 = 100
        }
        if (this.memberList[m].부스터류 % 10 !== 0 && this.memberList[m].부스터류 % 5 === 0) {
          this.memberList[m].부스터류 -= 5
        }
        if (this.memberList[m].부스터류 >= 100) {
          this.memberList[m].부스터류 = 100
        }
        if (this.memberList[m].클렌징 >= 30) {
          this.memberList[m].클렌징 = 30
        }
        if (this.memberList[m].타블렛 >= 30) {
          this.memberList[m].타블렛 = 30
        }
        if (this.memberList[m].가족과함께 >= 30) {
          this.memberList[m].가족과함께 = 30
        }
        if (this.memberList[m].마스크팩 >= 30) {
          this.memberList[m].마스크팩 = 30
        }
        if (this.memberList[m].민트팩 >= 30) {
          this.memberList[m].민트팩 = 30
        }
        this.memberList[m].아우터 = this.memberList[m].아우터 + this.memberList[m].마스크팩
        this.memberList[m].아우터 = this.memberList[m].아우터 + this.memberList[m].민트팩
        if (this.memberList[m].아우터 >= 60) {
          this.memberList[m].아우터 = 60
        }
      }
      var excelList = this.fommatToExcelList(this.memberList)
      console.log('▼▼▼▼▼▼▼▼▼엑셀 명단 입니다.▼▼▼▼▼▼▼▼▼')
      console.log(excelList)
      console.log('▲▲▲▲▲▲▲▲▲엑셀 명단 입니다.▲▲▲▲▲▲▲▲▲')
      var workBook = Xlsx.utils.book_new()
      var workSheet = Xlsx.utils.json_to_sheet(excelList)
      Xlsx.utils.book_append_sheet(workBook, workSheet, '도다집계')
      Xlsx.writeFile(workBook, '도다집계.xlsx')
      // 점수 초기화
      this.memberList.forEach(function (item) {
        item.식사류 = 0
        item.부스터류 = 0
        item.클렌징 = 0
        item.타블렛 = 0
        item.가족과함께 = 0
        item.마스크팩 = 0
        item.민트팩 = 0
        item.아우터 = 0
      })
    },
    saveOnTemp: function () {
      alert('아직 준비 중 입니다.')
    },
    loadOntemp: function () {
      alert('아직 준비 중 입니다.')
      this.getCookie()
    },
    changeMainCategory: function (index, value, ref) {
      this.$refs[ref].focus()
      if (this.isEmpty(value)) {
        return false
      } else if (value === '07' || value === '08' || value === '03' || value === '05') {
        this.targetList[index].point = '30'
      } else if (value === '15') {
        this.targetList[index].point = '0'
      } else if (value === '06' || value === '01' || value === '04') {
        this.targetList[index].point = '10'
      }
    },
    fommatToExcelList: function (list) {
      console.log(list)
      var newListtmp = JSON.stringify(list)
      var newList = JSON.parse(newListtmp)
      for (var i = 0; i < newList.length; i++) {
        delete newList[i].마스크팩
        delete newList[i].민트팩
      }
      // 이름순으로 정렬
      newList = newList.sort(function (a, b) {
        var x = a.이름.toLowerCase()
        var y = b.이름.toLowerCase()
        if (x < y) {
          return -1
        }
        if (x > y) {
          return 1
        }
        return 0
      })
      return newList
    },
    // 점수영역
    contentInfo: function (content) {
      var obj = {}
      obj.mainCategory = ''
      obj.point = ''
      if (this.isEmpty(content)) {
        return obj
      }
      if (content.indexOf('가족') !== -1 ||
          content.indexOf('아들') !== -1 ||
          content.indexOf('족') !== -1 ||
          content.indexOf('딸') !== -1 ||
          content.indexOf('남편') !== -1 ||
          content.indexOf('엄마') !== -1) {
        obj.mainCategory = '05'
        obj.point = '30'
        return obj
      } else if (content.indexOf('쉐') !== -1 ||
                 content.indexOf('쒜') !== -1 ||
                 content.indexOf('리빌드') !== -1 ||
                 content.indexOf('듀오') !== -1 ||
                 content.indexOf('두오') !== -1 ||
                 content.indexOf('프로틴바') !== -1 ||
                 content.indexOf('식이') !== -1 ||
                 content.indexOf('비빔밥') !== -1 ||
                 content.indexOf('커피') !== -1) {
        obj.mainCategory = '01'
        obj.point = '10'
        return obj
      } else if (content.indexOf('알로') !== -1 ||
                 content.indexOf('드링크') !== -1 ||
                 content.indexOf('헬드') !== -1 ||
                 content.indexOf('콜라겐') !== -1 ||
                 content.indexOf('콜라갠') !== -1 ||
                 content.indexOf('헬스') !== -1) {
        obj.mainCategory = '02'
        obj.point = '10'
        return obj
      } else if (content.toLowerCase().indexOf('cr') !== -1 ||
                 content.indexOf('뷰') !== -1 ||
                 content.indexOf('씨알') !== -1 ||
                 content.indexOf('리오') !== -1 ||
                 content.indexOf('오프') !== -1 ||
                 content.indexOf('리프') !== -1 ||
                 content.indexOf('나웍') !== -1 ||
                 content.indexOf('나이트') !== -1 ||
                 content.indexOf('웍스') !== -1 ||
                 content.indexOf('1리터') !== -1) {
        obj.mainCategory = '02'
        obj.point = '10'
        return obj
      } else if (content.indexOf('민트') !== -1) {
        obj.mainCategory = '08'
        obj.point = '30'
        return obj
      } else if (content.indexOf('허브') !== -1) {
        if (content.indexOf('1.5') !== -1) {
          obj.mainCategory = '02'
          obj.point = '15'
          return obj
        } else if (content.indexOf('1') !== -1 ||
                   content.indexOf('째') !== -1) {
          obj.mainCategory = '02'
          obj.point = '10'
          return obj
        } else if (content.indexOf('2.5') !== -1) {
          obj.mainCategory = '02'
          obj.point = '25'
          return obj
        } else if (content.indexOf('2') !== -1) {
          obj.mainCategory = '02'
          obj.point = '20'
          return obj
        } else if (content.indexOf('3') !== -1) {
          obj.mainCategory = '02'
          obj.point = '30'
          return obj
        } else if (content.indexOf('5') !== -1) {
          obj.mainCategory = '02'
          obj.point = '5'
          return obj
        }
        obj.mainCategory = '02'
        obj.point = '10'
        return obj
      } else if (content.indexOf('유산균') !== -1) {
        obj.mainCategory = '04'
        obj.point = '10'
        return obj
      } else if (content.indexOf('클렌저') !== -1 ||
                 content.indexOf('클랜저') !== -1) {
        obj.mainCategory = '06'
        obj.point = '10'
        return obj
      } else if (content.indexOf('클렌징') !== -1 ||
                 content.indexOf('클랜징') !== -1) {
        obj.mainCategory = '03'
        obj.point = '30'
        return obj
      } else if (content.indexOf('알') !== -1 ||
                 content.indexOf('타블') !== -1 ||
                 content.indexOf('멀티') !== -1 ||
                 content.indexOf('키토') !== -1 ||
                 content.indexOf('진센') !== -1 ||
                 content.indexOf('젠센') !== -1 ||
                 content.indexOf('셀유') !== -1) {
        obj.mainCategory = '04'
        obj.point = '10'
        return obj
      } else if (content.indexOf('로션') !== -1 ||
                 content.indexOf('젤') !== -1 ||
                 content.indexOf('쎄럼') !== -1 ||
                 content.indexOf('샴푸') !== -1 ||
                 content.indexOf('바디') !== -1 ||
                 content.indexOf('워시') !== -1 ||
                 content.indexOf('썬') !== -1 ||
                 content.indexOf('크림') !== -1) {
        obj.mainCategory = '06'
        obj.point = '10'
        return obj
      } else if (content.indexOf('2리터') !== -1) {
        obj.mainCategory = '02'
        obj.point = '20'
        return obj
      } else if (content.indexOf('500') !== -1 ||
                 content.indexOf('5백') !== -1 ||
                 content.indexOf('오백') !== -1 ||
                 content.indexOf('0.5') !== -1) {
        obj.mainCategory = '02'
        obj.point = '5'
        return obj
      } else if (content.indexOf('비타민팩') !== -1 ||
                 content.indexOf('마스크팩') !== -1) {
        obj.mainCategory = '07'
        obj.point = '30'
        return obj
      }
      return obj
    },
    // 다음으로 스크롤 이동
    moveScrollToNext: function (ref) {
      this.$refs[ref].scrollIntoView({ behavior: 'smooth' })
    },
    // 정렬
    sortList: function (value, list) {
      // 시간순 (공통수행)
      list = list.sort(function (a, b) {
        var x = new Date(a.writeTime)
        var y = new Date(b.writeTime)
        if (x < y) {
          return -1
        }
        if (x > y) {
          return 1
        }
        return 0
      })
      // 이름순
      if (value === '01') {
        list = list.sort(function (a, b) {
          var x = a.name.toLowerCase()
          var y = b.name.toLowerCase()
          if (x < y) {
            return -1
          }
          if (x > y) {
            return 1
          }
          return 0
        })
      }
    },
    readAsExcel: function () {
      console.log('readAsExcel')
    },
    /** *******************************************************************
    DB 영역
    ******************************************************************** **/
    getProductInfo: function () {
      var obj = {}
      obj.식사류 = {}
      obj.부스터류 = {}
      obj.클렌징 = {}
      obj.타블렛 = {}
      obj.가족과함께 = {}
      obj.아우터 = {}
      obj.마스크팩 = {}
      obj.민트팩 = {}
      return obj
    },
    getMember: function () {
      var list = [
        { 이름: '최나래', 클럽명: '논현퀸' },
        { 이름: '강은성', 클럽명: '시흥ok' },
        { 이름: '곽예은', 클럽명: '와와' },
        { 이름: '권혜민', 클럽명: '산본넘버원' },
        { 이름: '김경숙', 클럽명: '시흥ok' },
        { 이름: '김경숙2', 클럽명: '논현점핑' },
        { 이름: '김미나', 클럽명: '논현퀸' },
        { 이름: '김민형', 클럽명: '빼루와' },
        { 이름: '김여은', 클럽명: '점핑크루' },
        { 이름: '김은아', 클럽명: '탑' },
        { 이름: '김인선', 클럽명: '오힐링' },
        { 이름: '김재화', 클럽명: '러블리' },
        { 이름: '김진이', 클럽명: '또또와' },
        { 이름: '김태영', 클럽명: '와우점핑' },
        { 이름: '김현정', 클럽명: '탑' },
        { 이름: '김현희', 클럽명: '오힐링' },
        { 이름: '김혜란', 클럽명: '연수다와' },
        { 이름: '김효심', 클럽명: '산본넘버원' },
        { 이름: '김희선', 클럽명: '정왕다와' },
        { 이름: '김희순', 클럽명: '논현점핑' },
        { 이름: '김희정', 클럽명: '산본넘버원' },
        { 이름: '문정희', 클럽명: '힐다' },
        { 이름: '민창근', 클럽명: '러블리' },
        { 이름: '박미숙2', 클럽명: '서창ok' },
        { 이름: '박선례', 클럽명: '데이' },
        { 이름: '박수정', 클럽명: '또또와' },
        { 이름: '박은미', 클럽명: '빼루와' },
        { 이름: '박은정2', 클럽명: '쉽다 점핑' },
        { 이름: '박주랑', 클럽명: '정왕다와' },
        { 이름: '박혜주', 클럽명: '빼루와' },
        { 이름: '반혜영', 클럽명: '논현퀸' },
        { 이름: '방미진', 클럽명: '점핑크루' },
        { 이름: '방선아', 클럽명: '안산다와' },
        { 이름: '백현민', 클럽명: '에스핏' },
        { 이름: '서승현', 클럽명: '에스핏' },
        { 이름: '석호연', 클럽명: '웰니스' },
        { 이름: '성희선', 클럽명: '서창ok' },
        { 이름: '소임숙', 클럽명: '와우점핑' },
        { 이름: '손화정', 클럽명: '빼루와' },
        { 이름: '신미선', 클럽명: '웰니스' },
        { 이름: '신진영', 클럽명: '예스' },
        { 이름: '염은주', 클럽명: '러블리' },
        { 이름: '유미선', 클럽명: '빼루와' },
        { 이름: '유영희', 클럽명: '빼루와' },
        { 이름: '유현정', 클럽명: '논현넘버원' },
        { 이름: '윤미란', 클럽명: '오힐링' },
        { 이름: '윤서연', 클럽명: '탑' },
        { 이름: '이경심', 클럽명: '오힐링' },
        { 이름: '이경진', 클럽명: '와와' },
        { 이름: '이계련', 클럽명: '시흥ok' },
        { 이름: '이미나', 클럽명: '정왕다와' },
        { 이름: '이수혜', 클럽명: '점핑디바' },
        { 이름: '이신화', 클럽명: '러블리' },
        { 이름: '이애정', 클럽명: '빼루와' },
        { 이름: '이은희', 클럽명: '서창ok' },
        { 이름: '임은선', 클럽명: '점핑디바' },
        { 이름: '장연숙', 클럽명: '산본넘버원' },
        { 이름: '전유진', 클럽명: '오힐링' },
        { 이름: '정난숙', 클럽명: '오힐링' },
        { 이름: '정양호', 클럽명: '산본넘버원' },
        { 이름: '정인애', 클럽명: '정왕다와' },
        { 이름: '정혜리', 클럽명: '와우점핑' },
        { 이름: '조은희', 클럽명: '정왕다와' },
        { 이름: '조정임', 클럽명: '빼루와' },
        { 이름: '최순님', 클럽명: '안산다와' },
        { 이름: '최은경', 클럽명: '시흥ok' },
        { 이름: '최해경', 클럽명: '오힐링' },
        { 이름: '김혜숙', 클럽명: '산본넘버원' },
        { 이름: '박현숙', 클럽명: '배곧다와' },
        { 이름: '백지성', 클럽명: '올레' },
        { 이름: '서진', 클럽명: '논현퀸' },
        { 이름: '안대인', 클럽명: '안산다와' },
        { 이름: '엄예은', 클럽명: '정왕다와' },
        { 이름: '유오현', 클럽명: '오힐링' },
        { 이름: '천미소', 클럽명: '비채' },
        { 이름: '김순옥', 클럽명: '빼루와' },
        { 이름: '김초희', 클럽명: '서창ok' },
        { 이름: '황홍자', 클럽명: '서창ok' },
        { 이름: '이설희', 클럽명: '빼루와' },
        { 이름: '이연지', 클럽명: '와우점핑' },
        { 이름: '이연희', 클럽명: '산본넘버원' },
        { 이름: '박나영', 클럽명: '은계럭키' },
        { 이름: '장덕순', 클럽명: '빼루와' },
        { 이름: '정승윤', 클럽명: '또또와' },
        { 이름: '지서현', 클럽명: '빼루와' },
        { 이름: '한선미', 클럽명: '정왕다와' },
        { 이름: '박미숙', 클럽명: '또또와' },
        { 이름: '김경아', 클럽명: '러블리' },
        { 이름: '박미연', 클럽명: '또또와' },
        { 이름: '박미영', 클럽명: '은계럭키' },
        { 이름: '박은정', 클럽명: '시흥ok' },
        { 이름: '박정명', 클럽명: '서창오케이' },
        { 이름: '양정은', 클럽명: '은계럭키' },
        { 이름: '이승진', 클럽명: '탑' },
        { 이름: '이원아', 클럽명: '산본넘버원' },
        { 이름: '임재숙', 클럽명: '정왕다와' },
        { 이름: '정명희', 클럽명: '정왕다와' },
        { 이름: '정윤미', 클럽명: '러블리' },
        { 이름: '황금자', 클럽명: '논현점핑' },
        { 이름: '김민서', 클럽명: '빼루와' },
        { 이름: '김아라', 클럽명: '서창ok' },
        { 이름: '강미희', 클럽명: '탑' },
        { 이름: '신윤형', 클럽명: '빼루와' },
        { 이름: '홍유나', 클럽명: '올레' },
        { 이름: '최은영', 클럽명: '빼루와' }
      ]
      for (var i = 0; i < list.length; i++) {
        list[i].식사류 = 0
        list[i].부스터류 = 0
        list[i].클렌징 = 0
        list[i].타블렛 = 0
        list[i].가족과함께 = 0
        list[i].마스크팩 = 0
        list[i].민트팩 = 0
        list[i].아우터 = 0
      }
      list = list.sort(function (a, b) {
        var x = a.이름.toLowerCase()
        var y = b.이름.toLowerCase()
        if (x < y) {
          return -1
        }
        if (x > y) {
          return 1
        }
        return 0
      })
      return list
    }
  }
}
</script>
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.red {
  color: red;
  font-weight: bold;
}
.green {
  color: green;
  font-weight: bold;
}
.ft8 {
  font-size: 13px;
}
table {
  margin: auto;
}
input[type=checkbox] {
  zoom: 2.5;
}
.bold {
  font-weight: bold;
}
hr {
    border: 0;
    height: 1px;
    background: lightblue;
}
.ml-5 {
  margin-left: 5px;
}
.mr-5 {
  margin-right: 5px;
}
@media (min-width: 200px) and (max-width: 869px) {
  .mob-mb-20 {
    margin-bottom: 20px;
  }
}
.scroll-margin {
  scroll-margin: 160px;
}
table td {
  padding:10px;
}
</style>

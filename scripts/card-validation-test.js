/**
 * 卡密验证诊断脚本
 * 用于测试和监控卡密验证功能
 */

const { sequelize } = require('../config/database');
const db = require('../models');

// 卡密验证函数（与routes/hook.js保持一致）
const validateCardKey = (cardKey) => {
  if (!cardKey) return false;
  
  // 标准化Unicode字符串，避免编码问题
  const normalizedKey = cardKey.normalize('NFC').trim();
  
  // 严格验证：只允许5个汉字格式
  return /^[\u4e00-\u9fff]{5}$/.test(normalizedKey);
};

// 测试单个卡密
const testSingleCard = async (cardKey) => {
  console.log(`\n🔍 测试卡密: ${cardKey}`);
  
  try {
    // 1. 格式验证
    const isValidFormat = validateCardKey(cardKey);
    console.log(`📝 格式验证: ${isValidFormat ? '✅ 通过' : '❌ 失败'}`);
    
    if (!isValidFormat) {
      console.log(`   - 原始: "${cardKey}"`);
      console.log(`   - 长度: ${cardKey.length}`);
      console.log(`   - 字符码: ${cardKey.split('').map(c => c.charCodeAt(0)).join(', ')}`);
      return false;
    }
    
    // 2. 标准化处理
    const normalizedKey = cardKey.normalize('NFC').trim();
    console.log(`🔄 标准化: "${normalizedKey}"`);
    
    // 3. 数据库查询
    const start = Date.now();
    const card = await db.Card.findOne({
      where: {
        cardKey: normalizedKey,
        status: 'active'
      }
    });
    const queryTime = Date.now() - start;
    
    console.log(`⏱️  查询耗时: ${queryTime}ms`);
    console.log(`💾 数据库结果: ${card ? '✅ 找到' : '❌ 未找到'}`);
    
    if (card) {
      console.log(`   - ID: ${card.id}`);
      console.log(`   - 标题: ${card.title}`);
      console.log(`   - 点击次数: ${card.clickCount}`);
      console.log(`   - 创建时间: ${card.createdAt}`);
    }
    
    return !!card;
    
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    return false;
  }
};

// 批量测试卡密
const testMultipleCards = async (cardKeys) => {
  console.log(`\n🔍 批量测试 ${cardKeys.length} 个卡密`);
  
  const results = [];
  const start = Date.now();
  
  for (const cardKey of cardKeys) {
    const result = await testSingleCard(cardKey);
    results.push({ cardKey, success: result });
  }
  
  const totalTime = Date.now() - start;
  const successCount = results.filter(r => r.success).length;
  
  console.log(`\n📊 批量测试结果:`);
  console.log(`   - 总数: ${cardKeys.length}`);
  console.log(`   - 成功: ${successCount}`);
  console.log(`   - 失败: ${cardKeys.length - successCount}`);
  console.log(`   - 总耗时: ${totalTime}ms`);
  console.log(`   - 平均耗时: ${Math.round(totalTime / cardKeys.length)}ms`);
  
  return results;
};

// 数据库连接测试
const testDatabaseConnection = async () => {
  console.log('\n🔗 测试数据库连接...');
  
  try {
    const start = Date.now();
    await sequelize.authenticate();
    const connectTime = Date.now() - start;
    
    console.log(`✅ 数据库连接成功 (${connectTime}ms)`);
    
    // 测试连接池状态
    const pool = sequelize.connectionManager.pool;
    console.log(`📊 连接池状态:`);
    console.log(`   - 最大连接数: ${pool.options.max}`);
    console.log(`   - 最小连接数: ${pool.options.min}`);
    console.log(`   - 当前连接数: ${pool.size}`);
    console.log(`   - 空闲连接数: ${pool.available}`);
    console.log(`   - 使用中连接数: ${pool.using}`);
    console.log(`   - 等待连接数: ${pool.waiting}`);
    
    return true;
  } catch (error) {
    console.log(`❌ 数据库连接失败: ${error.message}`);
    return false;
  }
};

// 生成测试卡密
const generateTestCards = async (count = 5) => {
  console.log(`\n🎯 生成 ${count} 个测试卡密`);
  
  const cards = [];
  for (let i = 0; i < count; i++) {
    const cardKey = db.Card.generateSimpleKey();
    cards.push(cardKey);
    console.log(`   ${i + 1}. ${cardKey}`);
  }
  
  return cards;
};

// 主测试函数
const runDiagnostics = async () => {
  console.log('🚀 开始卡密验证诊断...');
  console.log('=' * 50);
  
  // 1. 数据库连接测试
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    console.log('❌ 数据库连接失败，终止测试');
    return;
  }
  
  // 2. 查询现有卡密进行测试
  try {
    const existingCards = await db.Card.findAll({
      where: { status: 'active' },
      limit: 3,
      attributes: ['cardKey', 'title']
    });
    
    if (existingCards.length > 0) {
      console.log(`\n📋 测试现有卡密 (${existingCards.length}个)`);
      const cardKeys = existingCards.map(c => c.cardKey);
      await testMultipleCards(cardKeys);
    } else {
      console.log('\n⚠️  未找到现有卡密，生成测试卡密');
      const testCards = await generateTestCards(3);
      await testMultipleCards(testCards);
    }
    
  } catch (error) {
    console.log(`❌ 查询卡密失败: ${error.message}`);
  }
  
  // 3. 性能测试
  console.log('\n⚡ 性能测试...');
  const perfTestCard = db.Card.generateSimpleKey();
  const times = [];
  
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    await testSingleCard(perfTestCard);
    times.push(Date.now() - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  
  console.log(`📊 性能统计:`);
  console.log(`   - 平均响应时间: ${avgTime.toFixed(2)}ms`);
  console.log(`   - 最快响应时间: ${minTime}ms`);
  console.log(`   - 最慢响应时间: ${maxTime}ms`);
  
  console.log('\n✅ 诊断完成');
};

// 如果直接运行此脚本
if (require.main === module) {
  runDiagnostics()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ 诊断失败:', error);
      process.exit(1);
    });
}

module.exports = {
  validateCardKey,
  testSingleCard,
  testMultipleCards,
  testDatabaseConnection,
  runDiagnostics
}; 